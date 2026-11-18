# LivingSpace frontend

Next.js 16 App Router application for LivingSpace. The product, design, and API contracts live in the parent `Documents/` folder.

## Setup

Node.js `>=20.9.0` and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

The app listens at http://localhost:3000 and calls the API from `NEXT_PUBLIC_API_URL` (http://localhost:4000 in local development).

## Checks

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

`npm test` runs the Node test runner against schema, navigation, and formatting checks. It does not drive a browser.

## Environment

Copy names from `.env.example`. Never put the Supabase service-role key or a database URL in a `NEXT_PUBLIC_` variable.
