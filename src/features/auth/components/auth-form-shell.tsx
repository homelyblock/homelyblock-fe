"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { useI18n } from "@/i18n/provider";

type AuthCopy =
  | "signIn"
  | "signUp"
  | "reset"
  | "update"
  | "admin";

const COPY_KEYS: Record<AuthCopy, { title: string; description: string }> = {
  signIn: { title: "auth.signInTitle", description: "auth.signInBody" },
  signUp: { title: "auth.signUpTitle", description: "auth.signUpBody" },
  reset: { title: "auth.resetTitle", description: "auth.resetBody" },
  update: { title: "auth.updateTitle", description: "auth.updateBody" },
  admin: { title: "auth.adminTitle", description: "auth.adminBody" },
};

type AuthFormShellProps = {
  copy: AuthCopy;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
};

export function AuthFormShell({
  copy,
  children,
  footer,
  wide = false,
}: AuthFormShellProps) {
  const { t } = useI18n();
  const keys = COPY_KEYS[copy];

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="hidden flex-col justify-between bg-forest px-10 py-12 text-forest-foreground lg:flex">
        <Logo href="/" tone="inverse" />
        <div className="max-w-md space-y-6">
          <h2 className="text-4xl font-semibold tracking-tight">{t("auth.panelTitle")}</h2>
          <p className="text-sm leading-6 text-forest-foreground/80">{t("auth.panelBody")}</p>
          <ul className="space-y-2 text-sm text-forest-foreground/85">
            <li>{t("auth.panelPoint1")}</li>
            <li>{t("auth.panelPoint2")}</li>
            <li>{t("auth.panelPoint3")}</li>
          </ul>
        </div>
        <p className="text-sm text-forest-foreground/70">{t("auth.panelFoot")}</p>
      </section>
      <main id="main" className="flex flex-col justify-center bg-background px-4 py-10 sm:px-6">
        <div className={`motion-rise mx-auto w-full ${wide ? "max-w-xl" : "max-w-md"}`}>
          <div className="mb-8 lg:hidden">
            <Logo href="/" />
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t(keys.title)}</h1>
              <p className="text-sm leading-6 text-muted-foreground">{t(keys.description)}</p>
            </div>
            <div className="mt-8 space-y-6">{children}</div>
            {footer ? (
              <div className="mt-8 text-sm text-muted-foreground">{footer}</div>
            ) : (
              <p className="mt-8 text-sm text-muted-foreground">
                <Link href="/" className="font-medium text-foreground underline-offset-4 hover:underline">
                  {t("auth.backHome")}
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export function SignInFooter() {
  const { t } = useI18n();
  return (
    <p>
      {t("auth.needAccount")}{" "}
      <Link href="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">
        {t("auth.getStarted")}
      </Link>
    </p>
  );
}

export function SignUpFooter() {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      <p>
        {t("auth.agreeBefore")}{" "}
        <Link href="/terms" className="font-medium text-foreground underline-offset-4 hover:underline">
          {t("auth.terms")}
        </Link>
        ,{" "}
        <Link href="/privacy-policy" className="font-medium text-foreground underline-offset-4 hover:underline">
          {t("auth.privacy")}
        </Link>
        ,{" "}
        <Link href="/acceptable-use" className="font-medium text-foreground underline-offset-4 hover:underline">
          {t("auth.acceptable")}
        </Link>
        .
      </p>
      <p>
        {t("auth.already")}{" "}
        <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
          {t("auth.signIn")}
        </Link>
      </p>
    </div>
  );
}

export function ResetFooter() {
  const { t } = useI18n();
  return (
    <p>
      {t("auth.remembered")}{" "}
      <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
        {t("auth.backToSignIn")}
      </Link>
    </p>
  );
}

export function AdminFooter() {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      <p>{t("auth.adminResetNote")}</p>
      <p>
        {t("auth.notOwner")}{" "}
        <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
          {t("auth.publicSignIn")}
        </Link>
      </p>
    </div>
  );
}
