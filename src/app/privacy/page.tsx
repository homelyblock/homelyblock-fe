import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { privateRobots } from "@/features/marketing/public-metadata";

export const metadata: Metadata = privateRobots;
export const instant = false;

export default function PrivacyAliasPage() {
  permanentRedirect("/privacy-policy");
}
