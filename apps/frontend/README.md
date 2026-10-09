# Frontend App (Remix-Style React Router)

This app is scaffolded under `apps/frontend` and follows the modern React Router framework mode (the maintained successor to Remix v2 framework features).

## What is Included

- Tabler Pro-ready CSS pipeline:
  - `public/styles/tabler-pro.min.css` (placeholder file)
  - `public/styles/tabler-overrides.css` (project theme overrides)
- Loader/action API integration boilerplate:
  - GET example in `app/routes/api-demo.tsx` loader
  - POST example in `app/routes/api-demo.tsx` action
  - Shared backend fetch utility in `app/lib/backend.server.ts`

## Environment

Set your backend URL before running the app:

```bash
export BACKEND_API_URL=http://localhost:3000
```

The app defaults to `http://localhost:3000` if this variable is not set.

## Run in Monorepo

From repository root:

```bash
pnpm install
pnpm --filter apps-frontend start:dev
```

Or run all dev services through turbo:

```bash
pnpm dev
```

## Tabler Pro Asset Note

`public/styles/tabler-pro.min.css` currently imports the public Tabler Core CSS as a fallback. Replace that file with your licensed Tabler Pro CSS bundle when available.

## Build

```bash
pnpm --filter apps-frontend build
pnpm --filter apps-frontend typecheck
```
