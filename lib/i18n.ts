import { tr } from "./i18n.tr";
import enDict from "./i18n.en.json";

export type Lang = "tr" | "en";

type Dict = Record<string, unknown>;

export const translations: Record<Lang, Dict> = {
  tr: tr as unknown as Dict,
  en: enDict as Dict,
};

export function getTranslation(lang: Lang, key: string): string {
  const parts = key.split(".");
  let cursor: unknown = translations[lang];
  for (const part of parts) {
    if (cursor && typeof cursor === "object" && part in (cursor as Dict)) {
      cursor = (cursor as Dict)[part];
    } else {
      // Fallback to Turkish when an English key is missing
      if (lang !== "tr") return getTranslation("tr", key);
      return key;
    }
  }
  return typeof cursor === "string" ? cursor : key;
}
