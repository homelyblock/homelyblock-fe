import Link from "next/link";
import { SignInScreen } from "@/features/auth/components/sign-in-screen";

export const instant = false;

type SignInPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  return (
    <SignInScreen
      audience="member"
      title="Sign in"
      description="Society administrators and residents sign in here."
      next={params.next}
      error={params.error}
      footer={
        <p>
          Need an account?{" "}
          <Link href="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">
            Get started
          </Link>
        </p>
      }
    />
  );
}
