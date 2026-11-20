# HomelyBlock — Development

How to change the application without breaking the society, membership, or billing rules.

## What the product does

One public sign-up serves residents and society admins. Society-admin sign-up creates the society and that person’s active admin membership. Resident sign-up does not create a membership. A resident enters a society only after an administrator invites them and activates the membership. Platform owners are provisioned separately and sign in at `/admin/sign-in`.

Society data is available only to an active membership in that society, or to a platform owner where the API allows it. Invited, suspended, removed, and expired memberships do not grant access. The last active society admin cannot be removed.

Maintenance billing records amounts an administrator enters. The product does not collect card or UPI payments. There is no SMS, WhatsApp gateway, or gate hardware.

The interface is English, Hindi, and Marathi. Visible copy belongs in `homelyblock-fe/src/i18n/messages/en.ts`, `hi.ts`, and `mr.ts`. Adding a key to one catalog and not the others fails the type check and the translation test.

## Where code lives

| Area | Location |
| --- | --- |
| Pages | `homelyblock-fe/src/app` |
| Feature UI and API calls | `homelyblock-fe/src/features` |
| Shared UI | `homelyblock-fe/src/components` |
| API modules | `homelyblock-be/src` |
| Schema and migrations | `homelyblock-be/prisma` |
| API tests | `homelyblock-be` Vitest e2e config |
| Database tests | `homelyblock-be/test/integration` |

The browser keeps the Supabase session. The API accepts the Supabase access token, not the browser cookie. Roles come from `user_profiles` and society memberships, not from editable token metadata. Passwords are stored by Supabase only.

## Rules that are already implemented

- Authorize every society query on the server. Hiding a button is not the control.
- Do not trust a society, unit, member, or role id sent by the client.
- Signup choices are stored server-side and tied to the authenticated Supabase user. They cannot be replayed to change a role.
- Invitation activation updates a row only when it is still `INVITED` and `invitation_expires_at` is in the future. The default lifetime is 14 days (`INVITATION_TTL_DAYS`, range 1–90).
- Bill publish, cancel, payment, and the matching audit record run in one database transaction.
- Composite society foreign keys are in Prisma where every column is required. Optional composite keys stay as SQL in the migrations. Do not drop them. `src/prisma/managed-integrity.ts` fails the build if a migration removes one.
- Rate limiting uses the client address. `TRUSTED_PROXY_HOPS` stays `0` unless the deployment topology is known.
- Swagger is off when `NODE_ENV=production`.
- Do not log tokens, passwords, or payment details.

## Database changes

1. Change `prisma/schema.prisma` on a development database.
2. Create the migration with `npm run prisma:migrate` in `homelyblock-be`.
3. If existing data can violate a new constraint, make the migration stop with an error. Do not silently update or delete rows to make it pass.
4. Apply the reviewed SQL elsewhere with `npm run prisma:migrate:deploy`.
5. Add or extend an integration test when the change affects isolation, membership, or money.

`scripts/migration-preflight.mjs` only counts risky rows and only connects to localhost.

## Checks before you finish

Backend, from `homelyblock-be`:

```bash
npm run lint
npm test
npm run test:e2e
npm run test:integration
npx tsc -p tsconfig.build.json --pretty false
npm run build
```

Frontend, from `homelyblock-fe`:

```bash
npm run lint
npx tsc --noEmit --pretty false
npm test
npm run build
```

`npm run test:integration` refuses to run unless the database host is localhost and the database name contains `livingspace_test`. A skipped suite is not a pass.

When a change is visible in the browser, exercise that screen. Public pages should be checked in Hindi as well as English, including a phone-width layout.

## Do not add

Online payments, SMS or WhatsApp sending, gate hardware, analytics tags, or a new authentication system. Do not invent a legal name, address, GSTIN, CIN, or grievance contact. Those stay unpublished until the operator supplies them.
