import type { Metadata } from "next";
import { AdminFooter } from "@/features/auth/components/auth-form-shell";
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
      copy="admin"
      next={params.next}
      error={params.error}
      footer={<AdminFooter />}
    />
  );
}
