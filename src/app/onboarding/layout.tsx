import type { ReactNode } from "react";
import { AppFrame } from "@/components/layout/app-frame";
import { privateRobots } from "@/features/marketing/public-metadata";

export const metadata = privateRobots;

export const instant = false;

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}
