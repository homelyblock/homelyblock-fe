import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StatusPage } from "@/components/layout/status-views";

export const instant = false;

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      description="That address is not part of HomelyBlock. Check the link or return to your societies."
    >
      <Link href="/" className={buttonVariants()}>
        Back to home
      </Link>
      <Link href="/societies" className={buttonVariants({ variant: "outline" })}>
        Go to societies
      </Link>
    </StatusPage>
  );
}
