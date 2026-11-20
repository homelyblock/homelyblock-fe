import { PublicPage } from "@/features/marketing/public-page";
import { publicPageMetadata } from "@/features/marketing/public-metadata";
import { AcceptableUseBody } from "@/features/marketing/acceptable-use-body";

export const metadata = publicPageMetadata({
  title: "Acceptable use",
  description: "What you may and may not do with a HomelyBlock account.",
  path: "/acceptable-use",
});

export const instant = false;

export default function AcceptableUsePage() {
  return (
    <PublicPage title="Acceptable use" description="Use HomelyBlock for genuine society operations.">
      <AcceptableUseBody />
    </PublicPage>
  );
}
