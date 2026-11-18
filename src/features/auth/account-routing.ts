export const AUTH_ENTRY_COOKIE = "ls_auth_entry";

export type AuthEntry = "member" | "platform";

export type AccountHome = {
  platformRole: "PLATFORM_OWNER" | null;
  accountType?: "SOCIETY_ADMIN" | "RESIDENT_USER" | null;
  memberships: Array<{ status: string; societyId: string }>;
};

export type OnboardingRequest =
  | { accountType: "RESIDENT_USER"; phone?: string }
  | {
      accountType: "SOCIETY_ADMIN";
      societyName?: string;
      city?: string;
      state?: string;
      phone?: string;
    };

/**
 * Where a signed-in account should land.
 * accountType is only a setup choice. Access still follows platform role
 * and ACTIVE memberships.
 */
export function homePathForAccount(account: AccountHome): string {
  if (account.platformRole === "PLATFORM_OWNER") {
    return "/societies";
  }

  const active = account.memberships.filter(
    (membership) => membership.status === "ACTIVE",
  );
  if (active.length === 1) {
    return `/societies/${active[0]?.societyId}`;
  }
  if (active.length > 1) {
    return "/societies";
  }
  const waiting = account.memberships.some((membership) =>
    membership.status === "INVITED" ||
    membership.status === "SUSPENDED" ||
    membership.status === "REMOVED",
  );
  if (waiting || account.accountType === "RESIDENT_USER") {
    return "/onboarding/pending";
  }
  if (account.accountType === "SOCIETY_ADMIN") {
    return "/societies";
  }
  return "/onboarding";
}

export function authEntryFromCookie(
  value: string | undefined | null,
): AuthEntry {
  return value === "platform" ? "platform" : "member";
}

export function signInPathForEntry(entry: AuthEntry): "/sign-in" | "/admin/sign-in" {
  return entry === "platform" ? "/admin/sign-in" : "/sign-in";
}

export function signOutDestination(
  returnTo: FormDataEntryValue | null,
): "/sign-in" | "/admin/sign-in" {
  return returnTo === "/admin/sign-in" ? "/admin/sign-in" : "/sign-in";
}

/**
 * Display name only. Registration role and society details are not stored in
 * Supabase user metadata, because the account holder can edit that metadata.
 */
export function signupMetadata(input: { fullName: string }): Record<string, string> {
  return { full_name: input.fullName.trim() };
}

export type SignupIntentPayload = { userId: string } & OnboardingRequest;

/** Body sent from the Next.js server to the protected signup-intent endpoint. */
export function signupIntentPayload(
  userId: string,
  input: {
    accountType: string;
    societyName?: string;
    city?: string;
    state?: string;
    phone?: string;
  },
): SignupIntentPayload {
  return {
    userId,
    ...toOnboardingRequest(input),
  };
}

/**
 * Body sent to onboarding. Resident requests never include society fields,
 * and platform ownership is not a selectable type.
 */
export function toOnboardingRequest(input: {
  accountType: string;
  societyName?: string;
  city?: string;
  state?: string;
  phone?: string;
}): OnboardingRequest {
  if (input.accountType === "RESIDENT_USER") {
    return {
      accountType: "RESIDENT_USER",
      ...(input.phone ? { phone: input.phone } : {}),
    };
  }
  if (input.accountType === "SOCIETY_ADMIN") {
    return {
      accountType: "SOCIETY_ADMIN",
      societyName: input.societyName,
      city: input.city,
      ...(input.state ? { state: input.state } : {}),
      ...(input.phone ? { phone: input.phone } : {}),
    };
  }
  throw new Error("Unsupported account type");
}
