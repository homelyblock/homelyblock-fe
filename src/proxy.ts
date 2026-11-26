import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Skip Next internals, favicon, raster icons, and PWA static assets.
     * Manifest / SW / offline are also listed in isPublicPath as defense in depth.
     */
    "/((?!_next/|favicon.ico|sw\\.js$|offline\\.html$|manifest\\.webmanifest$|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
