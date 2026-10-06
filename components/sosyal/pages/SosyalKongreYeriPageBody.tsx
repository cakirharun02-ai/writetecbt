"use client";

import { useLang } from "@/components/LanguageProvider";
import { SosyalSection, SosyalProse } from "@/components/sosyal/SosyalSection";

const P = "pages.sosyal.kongreYeri";
const EYEBROW = "pages.sosyal.eyebrow.congressInfo";

export function SosyalKongreYeriPageBody() {
  const { t } = useLang();

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <SosyalProse>
        <p>{t(`${P}.body`)}</p>
      </SosyalProse>
    </SosyalSection>
  );
}
