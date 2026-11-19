"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";

export function AppLogo() {
  const pathname = usePathname();
  const societyId = pathname.match(/^\/societies\/([^/]+)/)?.[1];
  const href =
    societyId && societyId !== "new" ? `/societies/${societyId}` : "/societies";

  return <Logo href={href} />;
}
