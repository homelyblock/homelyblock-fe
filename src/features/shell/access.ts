import { redirect } from "next/navigation";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import {
  getServerAccessToken,
  redirectToSignIn,
} from "@/features/auth/server-session";
import { fetchMe } from "@/features/societies/api";
import type { MeResponse } from "@/features/societies/types";
import { redirectForLoadFailure } from "./navigation";

export {
  canManageSociety,
  canViewSociety,
  directoryAccessRedirect,
  hasActiveSocietyMembership,
} from "./society-access";

export type CurrentSession = {
  token: string;
  me: MeResponse;
};

export async function loadCurrentSession(): Promise<CurrentSession> {
  if (!getSupabasePublicConfig()) {
    redirect("/sign-in");
  }

  const token = await getServerAccessToken();
  if (!token) {
    await redirectToSignIn();
    throw new Error("Redirect failed");
  }

  try {
    const me = await fetchMe(token);
    return { token, me };
  } catch (error) {
    redirectForLoadFailure(error);
  }
}
