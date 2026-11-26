import type { ReactNode } from "react";
import { loadCurrentSession } from "@/features/shell/access";
import { TopBar } from "./top-bar";

type AppFrameProps = {
  children: ReactNode;
};

export async function AppFrame({ children }: AppFrameProps) {
  const { me } = await loadCurrentSession();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <TopBar
        email={me.email}
        displayName={me.displayName}
        signOutReturnTo={
          me.platformRole === "PLATFORM_OWNER" ? "/admin/sign-in" : "/sign-in"
        }
      />
      <main id="main" className="pb-[env(safe-area-inset-bottom)]">
        {children}
      </main>
    </div>
  );
}
