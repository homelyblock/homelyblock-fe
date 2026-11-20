# HomelyBlock

Next.js 16 application. Setup, engineering rules, the testing script, and the design system are in `docs/`.

Node.js `>=20.9.0` and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

The application listens at http://localhost:3000 and calls `NEXT_PUBLIC_API_URL` (http://localhost:4000 locally).

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

`npm test` does not drive a browser. Never put a database URL or a Supabase service-role key in a `NEXT_PUBLIC_` variable.
