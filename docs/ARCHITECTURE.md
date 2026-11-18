# Frontend Architecture

Next.js App Router code lives under `src/`. `public/`, `package.json`, `next.config.ts`, and `.env*` stay at the repository root. The `@/*` path alias maps to `src/*`.

## Where code goes

| Path | Responsibility |
| --- | --- |
| `src/app/` | Routes, layouts, and global styles. |
| `src/components/ui/` | Reusable primitive UI, including the existing shadcn button. |
| `src/components/layout/` | Shared chrome such as headers, sidebars, and navigation. Add this folder with the first real layout component. |
| `src/features/<feature>/` | Feature components, hooks, types, and logic. Add a feature folder only when that feature is being built. |
| `src/lib/` | Shared helpers and third-party setup. `src/lib/utils.ts` re-exports `cn` for shadcn. |
| `src/services/` | The API client. Do not call `fetch` ad hoc from features. |
| `src/store/` | Redux Toolkit store, `RootState`, `AppDispatch`, and typed hooks. |
| `src/hooks/` | Hooks used by more than one feature. |
| `src/types/` | Types shared across features. |
| `src/utils/` | Small pure helpers that are not third-party setup. |
| `src/config/` | Validated public configuration. |

Empty folders are not checked in. Create one when it gets its first file.

## State

- Short-lived UI state stays in the component.
- Shared client state, such as a UI preference used by more than one route, goes in a Redux slice registered in `src/store/store.ts`.
- Server data and API caches stay in TanStack Query. Do not copy API responses into Redux.
- Do not put passwords, tokens, or Supabase service-role credentials in Redux.

### Redux

| Piece | Location |
| --- | --- |
| Store | `src/store/store.ts` — `configureStore`, `RootState`, `AppDispatch` |
| Hooks | `src/store/hooks.ts` — `useAppDispatch` and `useAppSelector` via React Redux `withTypes` |
| Provider | `src/components/providers.tsx` — client `Provider` and `QueryClientProvider` |
| Layout | `src/app/layout.tsx` remains a server component and renders `<AppProviders>` |

The store currently uses a placeholder reducer and has no feature slices. Its state is `{}`. Unknown actions leave that state unchanged.

Add a slice only when a feature needs shared client state. Replace the placeholder reducer with a reducer map:

```ts
export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
  },
});
```

`RootState` and `AppDispatch` are inferred from that store, so the typed hooks pick up the new slice without a manual type update. Do not add slices for authentication, societies, residents, visitors, or notices until those features exist.

`npm test` runs `src/store/store.test.ts` with Node's built-in test runner. It checks that the app store initializes and that `configureStore` applies a reducer action. It does not add a test framework.

## API

`getPublicConfig()` reads `NEXT_PUBLIC_API_URL` and falls back to `http://localhost:4000`. The value must be an http(s) origin with no path. The proposed `/api/v1` prefix is not part of that origin.

`apiRequest()` in `src/services/api-client.ts` builds URLs from that origin and normalizes HTTP errors into `ApiError`. Pass `accessToken` for NestJS protected routes. Helpers in `src/features/auth/session.ts` read the Supabase access token; a cookie session alone is not API authorization.

### Authentication

| Piece | Location |
| --- | --- |
| Public Supabase env | `src/config/supabase-public-env.ts` |
| Browser / server clients | `src/lib/supabase/client.ts`, `server.ts` |
| Session refresh proxy | `src/proxy.ts` → `src/lib/supabase/proxy.ts` |
| Auth flows | `src/features/auth/` + routes under `src/app/sign-*` and `src/app/auth/` |

Do not store passwords, tokens, or service-role credentials in Redux.

Browser-only libraries stay in client components. The root layout remains a server component.

## Societies feature

| Piece | Location |
| --- | --- |
| Routes | `/societies`, `/societies/new`, `/societies/[societyId]` |
| API helpers | `src/features/societies/api.ts` |
| Forms / lists | `src/features/societies/components/` |
| Shell | `src/components/layout/app-header.tsx` |

Create-society UI is shown to platform owners based on `GET /api/v1/me`; the NestJS API still enforces `PLATFORM_OWNER` on `POST /api/v1/societies`. Initial admin selection uses `GET /api/v1/users/search`. The same search, scoped to the society, is used when an active society admin adds a member. Residents are not given the control, and the API rejects their calls. Society edit uses `PATCH /api/v1/societies/:societyId` (owner or society admin).

## Current UI

`src/app/page.tsx` remains the starter landing page. Authenticated society management lives under `/societies`.
