"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusPage } from "@/components/layout/status-views";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <StatusPage
      code="Error"
      title="Something went wrong"
      description="The page could not be loaded. Try again, or return to your societies if the problem continues."
    >
      <Button type="button" onClick={() => reset()}>
        Try again
      </Button>
      <Link href="/societies" className={buttonVariants({ variant: "outline" })}>
        Go to societies
      </Link>
    </StatusPage>
  );
}
