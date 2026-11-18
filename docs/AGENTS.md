# LivingSpace Frontend — Agent Rules

Read the workspace-level `AGENTS.md`, `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, and `API.md` when available before changing behavior. The workspace-level files are canonical; this repository's rules add frontend-specific constraints.

- Inspect the current Next.js structure, package scripts, and components before editing.
- Follow `DESIGN.md`; do not invent a parallel design system.
- Use TypeScript and the project's existing router, styling, and component conventions.
- Centralize API requests and normalize errors.
- Backend authorization is authoritative; UI role checks are only for presentation.
- Never expose private keys, database credentials, or service-role keys in client code.
- Handle loading, empty, success, validation, error, and forbidden states.
- Build responsive, accessible screens with labels and visible focus.
- Reuse components where appropriate; avoid premature abstractions and unused dependencies.
- Do not add product features not approved by `PRD.md`.
- Update shared docs/contracts when a frontend change reveals a required product/API change; do not silently change the contract.
- Run the actual lint, type-check, tests, and build scripts available in `package.json`; report anything not run.
