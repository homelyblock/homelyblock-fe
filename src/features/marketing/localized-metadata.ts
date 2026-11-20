import { cookies } from "next/headers";
import { t } from "@/i18n";
import { isLocale } from "@/i18n/types";
import { publicPageMetadata } from "@/features/marketing/public-metadata";

export async function localizedPublicMetadata(
  titleKey: string,
  descriptionKey: string,
  path: string,
) {
  const stored = (await cookies()).get("hb-locale")?.value;
  const locale = stored && isLocale(stored) ? stored : "en";
  const openGraphLocale = locale === "hi" ? "hi_IN" : locale === "mr" ? "mr_IN" : "en_IN";
  const metadata = publicPageMetadata({
    title: t(locale, titleKey),
    description: t(locale, descriptionKey),
    path,
  });
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      locale: openGraphLocale,
    },
  };
}
