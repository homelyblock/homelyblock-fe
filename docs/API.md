# Frontend API Reference

The workspace-level `API.md` is the canonical API contract. Do not invent endpoints or payload shapes from frontend assumptions.

- Keep API requests in a centralized client/service layer.
- Keep TypeScript response/request types aligned with the backend contract.
- Handle 400, 401, 403, 404, 409, 429, and 500 responses appropriately.
- Never treat frontend checks as backend authorization.
- Update the canonical API contract when a real requirement changes and coordinate the corresponding backend implementation.
