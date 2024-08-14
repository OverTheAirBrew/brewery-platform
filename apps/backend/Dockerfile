FROM node:18 AS base
RUN npm install -g turbo pnpm

FROM base AS builder

WORKDIR /app
COPY . .
RUN turbo prune @overtheairbrew/backend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer

WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
RUN turbo run build --filter=@overtheairbrew/backend...

FROM node:18-slim
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer /app/apps/backend/next.config.js .
COPY --from=installer /app/apps/backend/package.json .

# # Automatically leverage output traces to reduce image size
# # https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=installer --chown=nestjs:nodejs /app/apps/backend/package.json ./
# COPY --from=installer --chown=nestjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
# COPY --from=installer --chown=nestjs:nodejs /app/apps/web/public ./apps/web/public

# CMD node apps/web/server.js