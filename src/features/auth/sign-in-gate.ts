import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchMe } from "@/features/societies/api";
import { rethrowIfNavigation } from "@/features/shell/navigation";
import { homePathForAccount, type AuthEntry } from "./account-routing";
import { finishStoredSignup } from "./finish-signup";
import { getServerAccessToken } from "./server-session";

export type SignInContinuation =
  | { status: "anonymous" }
  | { status: "continue"; email: string; href: string }
  | { status: "rejected"; message: string };

const rejectedCopy: Record<AuthEntry, string> = {
  member:
    "Platform owner accounts cannot sign in here. Use the provisioned administrative entrance.",
  platform:
    "This entrance accepts only the provisioned platform owner account.",
};

export async function loadSignInContinuation(
  audience: AuthEntry,
  requestedNext: string | null,
): Promise<SignInContinuation> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims.email === "string" ? data.claims.email : null;
  if (!email) {
    return { status: "anonymous" };
  }

  const token = await getServerAccessToken();
  if (!token) {
    return {
      status: "rejected",
      message: "This session could not be verified. Sign in again.",
    };
  }

  try {
    const me = await fetchMe(token);
    const owner = me.platformRole === "PLATFORM_OWNER";
    if ((audience === "platform" && !owner) || (audience === "member" && owner)) {
      await supabase.auth.signOut();
      return { status: "rejected", message: rejectedCopy[audience] };
    }
    let finished = me;
    if (!owner) {
      try {
        finished = await finishStoredSignup(token, me);
      } catch (error) {
        rethrowIfNavigation(error);
        finished = me;
      }
    }
    return {
      status: "continue",
      email,
      href: requestedNext ?? homePathForAccount(finished),
    };
  } catch (error) {
    rethrowIfNavigation(error);
    return {
      status: "rejected",
      message: "This session could not be verified. Sign in again.",
    };
  }
}
