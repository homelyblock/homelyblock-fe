import { notFound, redirect, unstable_rethrow } from "next/navigation";
import { loadFailureDestination } from "./load-failure";

/** Re-throw Next.js navigation exceptions so try/catch does not replace them. */
export function rethrowIfNavigation(error: unknown): void {
  unstable_rethrow(error);
}

export function redirectForLoadFailure(error: unknown): never {
  rethrowIfNavigation(error);
  const destination = loadFailureDestination(error);
  if (destination === "not-found") {
    notFound();
  }
  if (destination === "session-expired") {
    redirect("/session-expired");
  }
  if (destination === "forbidden") {
    redirect("/forbidden");
  }
  redirect("/unavailable");
}
