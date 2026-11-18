# LivingSpace Frontend

Next.js + TypeScript frontend for LivingSpace.

## Status
Read the workspace-level `PRD.md` for intended scope. Requirements do not imply that a feature is already implemented.

## Setup
From this repository, with Node.js `>=20.9.0` and npm:

```bash
npm ci
npm run dev
```

The app listens at http://localhost:3000. Copy `.env.example` to `.env.local` to override the API origin. The default is `http://localhost:4000`. Details are in `docs/SETUP.md` and `docs/ARCHITECTURE.md`.

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

`npm test` checks the Redux store with Node's built-in test runner.

## Environment
`.env.example` documents `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never put database credentials or the Supabase service-role key in a `NEXT_PUBLIC_` variable.

## Conventions
- Follow the workspace `DESIGN.md`.
- Use a centralized typed API client.
- Handle API/session failures consistently.
- Keep frontend authorization checks as UX only; the backend must enforce permissions.
- Test mobile layouts and accessibility for core workflows.

## Shared documentation
The canonical product, design, architecture, database, and API documents live in the parent workspace. Open the whole `LivingSpace` directory in Cursor when working across repositories.
