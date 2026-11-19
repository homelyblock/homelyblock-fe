import { messages as en } from "./messages/en.ts";
import { messages as hi } from "./messages/hi.ts";
import { messages as mr } from "./messages/mr.ts";
import { translate, type MessageTree } from "./translate.ts";
import { type Locale } from "./types.ts";

const CATALOGS: Record<Locale, MessageTree> = { en, mr, hi };

export function messagesFor(locale: Locale): MessageTree {
  return CATALOGS[locale];
}

export function t(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const localized = translate(CATALOGS[locale], key, vars);
  if (localized !== key || locale === "en") return localized;
  return translate(CATALOGS.en, key, vars);
}
