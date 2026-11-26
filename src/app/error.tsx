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
      code="Something went wrong"
      title="We couldn’t load this page"
      description="Please try again. If it keeps happening, go back to your societies and continue from there."
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
