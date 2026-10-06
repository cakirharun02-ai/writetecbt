"use client";

import { useLang } from "@/components/LanguageProvider";
import { SosyalSection, SosyalProse } from "@/components/sosyal/SosyalSection";

const P = "pages.sosyal.degerlendirmeSureci";
const EYEBROW = "pages.sosyal.eyebrow.congressInfo";

export function SosyalDegerlendirmeSureciPageBody() {
  const { t } = useLang();

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <SosyalProse>
        <ul className="list-disc space-y-3 pl-5">
          <li>{t(`${P}.li1`)}</li>
          <li>{t(`${P}.li2`)}</li>
          <li>{t(`${P}.li3`)}</li>
        </ul>
      </SosyalProse>
    </SosyalSection>
  );
}
