export type LoadFailure = "session-expired" | "forbidden" | "not-found" | "unavailable";

/**
 * Page-load failures are not the same as a missing login.
 * A database or network outage must not look like an expired session.
 */
export function loadFailureDestination(error: unknown): LoadFailure {
  const status = httpStatus(error);
  if (status === 401) return "session-expired";
  if (status === 403) return "forbidden";
  if (status === 400 || status === 404) return "not-found";
  return "unavailable";
}

function httpStatus(error: unknown): number | undefined {
  if (!(error instanceof Error) || !("status" in error)) return undefined;
  const status = error.status;
  return typeof status === "number" ? status : undefined;
}
