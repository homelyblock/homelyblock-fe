# Frontend Setup

Verified on 2026-10-29 with Node.js v24.21.0 and npm 11.19.0. Next.js 16.4.3 requires Node.js `>=20.9.0`. This repository uses npm (`package-lock.json`, lockfileVersion 3).

## Install

From `livingspace-fe`:

```bash
npm ci
```

Use `npm install` only when intentionally updating dependencies. `node_modules` was already present during verification, so install was not re-run.

## Environment

```bash
cp .env.example .env.local
```

`.env.example` contains:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`NEXT_PUBLIC_API_URL` is the NestJS origin, without `/api/v1`. If unset, `src/config/public-env.ts` defaults to `http://localhost:4000`.

Supabase Auth public settings must both be set (URL + anon/publishable key) or both left unset. Auth pages show a configuration message when they are missing. Never put the Supabase service-role key or database credentials in `NEXT_PUBLIC_` variables. `.gitignore` ignores `.env*` and keeps `.env.example` trackable.

### Supabase dashboard (manual)

1. Create a Supabase project and copy the Project URL + anon/publishable key into `.env.local`.
2. Authentication → Providers: enable Email.
3. Authentication → URL configuration: set Site URL to `http://localhost:3000` (or your deployed origin) and add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/update-password`
4. Prefer asymmetric JWT signing keys (JWKS). The NestJS API verifies access tokens independently; a browser session alone does not authorize API calls.

The dev and production scripts bind the frontend to port **3000**:

- `npm run dev` → `next dev --port 3000`
- `npm run start` → `next start --port 3000`

## Run

```bash
npm run dev
```

Local URL: [http://localhost:3000](http://localhost:3000)

The backend API is a separate process at [http://localhost:4000](http://localhost:4000).

## Checks

There is no `typecheck` script. TypeScript is checked with `tsc` and again during `next build`. `npm test` runs the Redux store check with Node's built-in test runner.

| Command | Result on 2026-10-29 |
| --- | --- |
| `npm run lint` | Passed (eslint, no findings) |
| `npx tsc --noEmit` | Passed (TypeScript 5.9.3) |
| `npm test` | Passed (3 tests: store initializes, unknown actions do not change it, a reducer updates state) |
| `npm run build` | Re-run after auth changes |
| `npm run dev` | Ready at http://localhost:3000 |

Auth routes: `/sign-in`, `/sign-up`, `/password-reset`, `/auth/callback`, `/auth/update-password`. Session refresh runs in `src/proxy.ts`.

## Troubleshooting

- Port 3000 in use: stop the other process. The scripts always pass `--port 3000`.
- API connection failures: confirm the backend is running at the `NEXT_PUBLIC_API_URL` origin, by default http://localhost:4000. Protected API calls must send `Authorization: Bearer <access_token>` from the Supabase session.
- Auth pages say Supabase is not configured: set both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then restart `next dev`.
- Build failures: use the compiler output. Do not change dependency versions to silence an error without checking the lockfile.
