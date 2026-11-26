import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StatusPage } from "@/components/layout/status-views";

export const instant = false;

export default function NotFound() {
  return (
    <StatusPage
      code="Not found"
      title="This page isn’t here"
      description="The link may be wrong or out of date. You can go home or open your societies."
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
