# HomelyBlock — Testing

For the testing team. Use disposable accounts. Do not create societies or residents in a production database that already holds a real society, and do not reuse a resident’s personal email.

## Automated checks

Run these from a machine that has the repositories and a local database. They do not replace a pass on the deployed site.

Frontend, in `homelyblock-fe`:

```bash
npm run lint
npx tsc --noEmit --pretty false
npm test
npm run build
```

`npm test` includes the English, Hindi, and Marathi catalog check. The current local result is 66 passed and 0 skipped.

Backend, in `homelyblock-be`, with Docker Postgres running:

```bash
npm run lint
npm test
npm run test:e2e
npm run test:integration
npx tsc -p tsconfig.build.json --pretty false
npm run build
```

The current local result is 180 unit tests, 59 API tests, and 53 PostgreSQL integration tests, with 0 skipped. If the integration command exits because `DATABASE_URL_TEST` is missing, the database was not tested.

## Before testing a deployed environment

1. Confirm the frontend and API deployments are the commits you intend to test.
2. Confirm `npm run prisma:migrate:status` against that database reports no pending migrations. Setup steps and the exact command are in `SETUP.md`.
3. Open `GET /api/v1/health` and `GET /api/v1/health/ready`. Both should return 200, and the body should contain only a status.
4. Confirm `/api/docs` is not available when the API is running with `NODE_ENV=production`.

## Accounts

| Role | How to create it | Sign-in |
| --- | --- | --- |
| Platform owner | Sign in once, then an engineer sets `platform_role` in the database. See `SETUP.md`. | `/admin/sign-in` |
| Society admin | Public sign-up, choose society administrator, enter the society. | `/sign-in` |
| Resident | Public sign-up, choose resident. No society access until an admin activates a membership. | `/sign-in` |

Suggested disposable society: Greenview Residency, Baner, Pune. Use Indian phone numbers such as `+91 98765 43210`. A second person must register themselves. The product does not email invitations.

## Society admin journey

Sign in and confirm the new society opens.

1. Add a building, then a flat in that building.
2. Open members. Invite the registered resident. The membership stays invited and shows an expiry. The default is 14 days.
3. Sign in as that resident before activation. The pending-access page is expected. Society pages, bills, and complaints for that society must not open.
4. As the admin, activate the membership. As the resident, sign in again and confirm only that society’s flat, notices, and bills are visible.
5. Publish a notice. As the resident, confirm it is visible.
6. Register an expected visitor and a walk-in visitor. Confirm the resident sees the visit for their flat.
7. Raise a complaint as the resident. As the admin, move it through the allowed statuses. A backwards or invented status must be rejected.
8. Add a service-directory contact. The resident can view active contacts and cannot create or deactivate one.
9. Create a maintenance configuration, generate a bill, publish it, and record one payment. The balance changes once. Submitting the same payment again must not create a second payment.
10. Cancel a bill only through the product’s cancel action. The bill must not remain collectable.
11. With one active society admin, suspension or removal of that admin must be refused.
12. Sign out from each account. A protected page then asks for sign-in.

## Platform owner journey

Sign in at `/admin/sign-in`. The society list includes the society created above. Open it. A platform owner must not appear as a choice on public sign-up. Signing in at `/sign-in` with the platform-owner account must not grant a resident session.

## Security checks

Try these while signed in as the resident:

- Change the society id in the address bar.
- Change a flat, bill, complaint, visitor, or member id to one from another society.
- Open an admin URL such as members, bill generation, or society settings.

Each attempt must end on an error, forbidden, or not-found page, with no data from the other society. Repeat the other-society URL test as the society admin.

As the invited resident, before activation, the same society URLs must stay closed. After the admin revokes or suspends the membership, they must close again.

## Account recovery and contact

1. Use Forgot password on `/sign-in`. The message must arrive from Supabase. Open it, set a new password, and confirm the next page is sign-in. The old password must fail.
2. Submit the public contact form. If email is not configured, the page must say the message was saved and that no email was sent. It must not say the message was emailed.

## Language and layout

Switch the language to Hindi and reload. Navigation, the society screens you used, and the privacy, terms, cookies, and security pages should stay in Hindi, including the browser tab title on those legal pages. Repeat one screen in Marathi.

Check the home page and one society list at a phone width of about 360px. The page should scroll vertically only. Dialogs and tables must remain reachable. The legal pages must still say that the operator’s legal name, address, and grievance contact are not published. Do not treat a company name on the page as real unless the operator has configured it.

## Record the result

For each journey write PASS, FAIL, BLOCKED, or NOT TESTED. A PASS requires the deployed site or the command output, not an API test standing in for a browser check. If a migration is pending, mark the society journeys BLOCKED until `SETUP.md` has been followed.
