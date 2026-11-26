import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StatusPage } from "@/components/layout/status-views";

export const instant = false;

export default function ForbiddenPage() {
  return (
    <StatusPage
      code="No access"
      title="You don’t have access to this page"
      description="Ask a society administrator if you need permission, or go back to your societies."
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
