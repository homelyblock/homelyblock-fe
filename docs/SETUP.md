# HomelyBlock — Project setup

Local development and the production migration command. Do not put real secrets in this file.

## Prerequisites

- Node.js `>=20.9.0` and npm
- Docker Desktop, for local PostgreSQL
- A Supabase project for sign-in

## Local database

From `homelyblock-be`:

```bash
npm ci
cp .env.example .env
npm run db:up
npm run prisma:generate
npm run prisma:migrate:deploy
```

Docker Compose publishes PostgreSQL on `localhost:5434`. The development database is `livingspace_dev`. The integration-test database is `livingspace_test`. Create the test database once with `npm run db:create-test` if it is missing.

`npm run prisma:migrate` is `prisma migrate dev`. Use it only when you are creating a new migration on your own development database. Use `npm run prisma:migrate:deploy` to apply migrations that are already in the repository.

## Local API and application

Backend `.env` needs at least:

```bash
NODE_ENV=development
PORT=4000
API_PREFIX=api/v1
CORS_ORIGINS=http://localhost:3000
TRUSTED_PROXY_HOPS=0
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/livingspace_dev
DATABASE_URL_TEST=postgresql://postgres:postgres@localhost:5434/livingspace_test
```

Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` together, or leave both unset. Protected routes return 401 until they are set. `SIGNUP_INTENT_SECRET` must match the same value on the frontend server. Do not put the Supabase service-role key in the frontend.

From `homelyblock-fe`:

```bash
npm ci
cp .env.example .env.local
```

Set `NEXT_PUBLIC_API_URL=http://localhost:4000`, `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, and the Supabase URL plus one public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Never put a database URL, a service-role key, or a secret key in a `NEXT_PUBLIC_` variable.

In the Supabase dashboard, set the site URL and add these redirect URLs:

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/update-password`

Add the same two paths for the deployed site origin before testing password recovery there.

Start both from the workspace root with `./dev.sh`, or start them separately:

```bash
npm --prefix homelyblock-be run start:dev
npm --prefix homelyblock-fe run dev
```

- Application: http://localhost:3000
- API liveness: http://localhost:4000/api/v1/health
- API readiness: http://localhost:4000/api/v1/health/ready
- Swagger: http://localhost:4000/api/docs in development. In production, set `SWAGGER_ENABLED=true` on the API and redeploy. The docs are then at `https://<api-host>/api/docs`. Set it back to `false` when you are finished. The page lists routes. It does not bypass sign-in.

## First platform owner

Public sign-up cannot create a platform owner. After the person has signed in once, so a `user_profiles` row exists, run this against the development database only:

```sql
UPDATE user_profiles
SET platform_role = 'PLATFORM_OWNER'
WHERE id = '<supabase-auth-user-uuid>';
```

Confirm with `GET /api/v1/me`. The platform owner signs in at `/admin/sign-in`. Residents and society admins use `/sign-in` and `/sign-up`.

## Optional email

Contact email is sent only when `SUPPORT_EMAIL`, `MAIL_FROM`, and `RESEND_API_KEY` are all set on the API. Otherwise the message is stored and the form says that no email was sent. Invitations are in-app. Password recovery is sent by Supabase, not by HomelyBlock.

Leave `COMPLAINT_ATTACHMENT_STORAGE` unset unless complaint images are explicitly enabled. Uploads return 503 while storage is disabled.

Leave `TRUSTED_PROXY_HOPS` at `0` unless every request reaches the API through a known reverse proxy and clients cannot open the API port directly.

## Production database

Take a backup before migrating a database that already has society data.

Production migrations run when the API starts, not on every Git commit. `npm run start:prod` runs `prisma migrate deploy` and then starts the server. On Render, set the start command to `npm run start:prod`. `DATABASE_URL` on that service must be the Supabase direct connection (port 5432). Do not put the password in the repository.

A manual run from `homelyblock-be` uses the same command. Export the direct URL in the shell for that one command. If the output says `localhost:5434`, it updated the laptop database and did not touch production.

```bash
npm run prisma:migrate:status
npm run prisma:migrate:deploy
```

`migrate deploy` applies only migrations that are not yet recorded. If existing rows cross societies, emails differ only by case, or two active household members share a name, the migration stops and does not rewrite the data.

Do not run `scripts/fresh-migrate-check.mjs` against a shared or production database. That script creates a local database and then drops it. Do not run `prisma migrate dev` or `prisma migrate reset` against production.

After the migration, confirm both health URLs on the deployed API, then follow `TESTING.md`.
