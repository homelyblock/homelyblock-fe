export { getBrowserAccessToken } from "./browser-session";

// Server Components / route handlers should import getServerAccessToken from
// `@/features/auth/server-session` so client bundles never pull `next/headers`.
