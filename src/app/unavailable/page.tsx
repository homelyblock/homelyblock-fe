import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StatusPage } from "@/components/layout/status-views";

export const metadata = {
  title: "Unavailable — HomelyBlock",
};

export const instant = false;

export default function UnavailablePage() {
  return (
    <StatusPage
      code="Temporarily unavailable"
      title="We can’t reach HomelyBlock right now"
      description="Please wait a moment and try again. Your data is safe."
    >
      <Link href="/" className={buttonVariants()}>
        Back to home
      </Link>
      <Link href="/sign-in" className={buttonVariants({ variant: "outline" })}>
        Sign in
      </Link>
    </StatusPage>
  );
}
