"use client";

import { useLang } from "@/components/LanguageProvider";
import { SosyalSection, SosyalProse } from "@/components/sosyal/SosyalSection";

const P = "pages.sosyal.yabanciDilKurulu";
const EYEBROW = "pages.sosyal.eyebrow.congressInfo";
const C = "pages.sosyal.common";

export function SosyalYabanciDilKuruluPageBody() {
  const { t } = useLang();

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <SosyalProse>
        <p>{t(C + ".contentSoon")}</p>
      </SosyalProse>
    </SosyalSection>
  );
}
