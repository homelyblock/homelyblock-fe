import { SignInFooter } from "@/features/auth/components/auth-form-shell";
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
      copy="signIn"
      next={params.next}
      error={params.error}
      footer={<SignInFooter />}
    />
  );
}
