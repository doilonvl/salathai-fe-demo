import type { Locale } from "@/types/content";

const LOCALE_PREFIX: Record<Locale, string> = {
  vi: "",
  en: "/en",
};

export function getLocalePrefix(locale: Locale) {
  return LOCALE_PREFIX[locale];
}
