import type { Metadata } from "next";
import Link from "next/link";
import { SignInScreen } from "@/features/auth/components/sign-in-screen";
import { privateRobots } from "@/features/marketing/public-metadata";

export const metadata: Metadata = privateRobots;

export const instant = false;

type AdminSignInPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function AdminSignInPage({
  searchParams,
}: AdminSignInPageProps) {
  const params = await searchParams;

  return (
    <SignInScreen
      audience="platform"
      title="Platform owner sign in"
      description="This entrance is only for the provisioned platform owner account. It is not linked from the public site."
      next={params.next}
      error={params.error}
      footer={
        <div className="space-y-2">
          <p>After a password reset, return to this page to sign in.</p>
          <p>
            Society admin or resident?{" "}
            <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
              Use the public sign in
            </Link>
          </p>
        </div>
      }
    />
  );
}
