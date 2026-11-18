import type { ReactNode } from "react";
import { loadCurrentSession } from "@/features/shell/access";
import { TopBar } from "./top-bar";

type AppFrameProps = {
  children: ReactNode;
};

export async function AppFrame({ children }: AppFrameProps) {
  const { me } = await loadCurrentSession();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar
        email={me.email}
        displayName={me.displayName}
        signOutReturnTo={
          me.platformRole === "PLATFORM_OWNER" ? "/admin/sign-in" : "/sign-in"
        }
      />
      <main id="main">{children}</main>
    </div>
  );
}
