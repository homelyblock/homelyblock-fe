"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { useSubmitGuard } from "@/lib/use-submit-guard";
import { signOutAction } from "../actions";

export function SignOutButton({
  appearance = "default",
  returnTo = "/sign-in",
}: {
  appearance?: "default" | "sidebar";
  returnTo?: "/sign-in" | "/admin/sign-in";
}) {
  const { t } = useI18n();
  const { pending, guard } = useSubmitGuard();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        guard(async () => {
          await signOutAction(data);
        });
      }}
    >
      {returnTo === "/admin/sign-in" ? (
        <input type="hidden" name="returnTo" value="/admin/sign-in" />
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        variant={appearance === "sidebar" ? "ghost" : "outline"}
        className={
          appearance === "sidebar"
            ? "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            : "w-full"
        }
      >
        {pending ? t("common.working") : t("nav.signOut")}
      </Button>
    </form>
  );
}
