ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:${PNPM_HOME}/bin:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

ENV TURBO_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache bash openssl \
  && corepack enable \
  && corepack prepare pnpm@11.21.0 --activate \
  && pnpm add turbo --global

FROM base AS prune
WORKDIR /usr/src/app
ARG PROJECT

COPY . .

RUN turbo prune --scope=$PROJECT --docker

FROM base AS builder
WORKDIR /usr/src/app
ARG PROJECT

ENV CI=true
COPY --from=prune /usr/src/app/out/json/ .

RUN \
  --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile

COPY --from=prune /usr/src/app/out/full/ .

RUN --mount=type=secret,id=TURBO_TOKEN,env=TURBO_TOKEN \
  --mount=type=secret,id=TURBO_TEAM,env=TURBO_TEAM \
  turbo run build

RUN \
  --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --prod --no-optional --ignore-scripts

RUN rm -rf ./**/src/**

# Final image
FROM node:${NODE_VERSION}-alpine AS runner
ARG PROJECT

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /usr/src/app .
WORKDIR /app/apps/${PROJECT}

ARG PORT=8080
ENV PORT=${PORT}

ENV NODE_ENV=production
EXPOSE ${PORT}

ENTRYPOINT ["node"]
CMD ["dist/src/main.js"]