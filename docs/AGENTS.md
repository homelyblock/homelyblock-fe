# HomelyBlock frontend agent rules

Read `docs/DEVELOPMENT.md` and `docs/DESIGN.md` before changing screens.

- Inspect the current page and feature folder before editing.
- Follow `docs/DESIGN.md`. Do not add colors or a second design system.
- Keep user-facing copy in the English, Hindi, and Marathi catalogs together.
- Call the API through the existing client. The API enforces authorization. The interface only hides actions.
- Never put a database URL, service-role key, or secret key in a `NEXT_PUBLIC_` variable.
- Cover loading, empty, error, and forbidden states.
- Run the frontend checks in `docs/DEVELOPMENT.md`.
