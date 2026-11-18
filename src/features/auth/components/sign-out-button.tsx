import { Button } from "@/components/ui/button";
import { signOutAction } from "../actions";

export function SignOutButton({
  appearance = "default",
  returnTo = "/sign-in",
}: {
  appearance?: "default" | "sidebar";
  returnTo?: "/sign-in" | "/admin/sign-in";
}) {
  return (
    <form action={signOutAction}>
      {returnTo === "/admin/sign-in" ? (
        <input type="hidden" name="returnTo" value="/admin/sign-in" />
      ) : null}
      <Button
        type="submit"
        variant={appearance === "sidebar" ? "ghost" : "outline"}
        className={
          appearance === "sidebar"
            ? "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            : "w-full"
        }
      >
        Sign out
      </Button>
    </form>
  );
}
