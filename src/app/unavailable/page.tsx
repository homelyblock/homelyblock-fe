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
      code="Unavailable"
      title="HomelyBlock is temporarily unavailable"
      description="The application could not be reached. Wait a moment and try again. If you operate this deployment, check the API health endpoint and database connection."
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
