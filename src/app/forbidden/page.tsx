import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StatusPage } from "@/components/layout/status-views";

export const instant = false;

export default function ForbiddenPage() {
  return (
    <StatusPage
      code="403"
      title="You do not have access"
      description="This area is limited to another role. The server enforces that restriction even if a link is opened directly."
    >
      <Link href="/societies" className={buttonVariants()}>
        Go to societies
      </Link>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Back to home
      </Link>
    </StatusPage>
  );
}
