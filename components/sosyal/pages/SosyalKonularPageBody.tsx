"use client";

import { useLang } from "@/components/LanguageProvider";
import { SosyalSection, SosyalProse } from "@/components/sosyal/SosyalSection";

const P = "pages.sosyal.konular";
const EYEBROW = "pages.sosyal.eyebrow.congressInfo";

export function SosyalKonularPageBody() {
  const { t } = useLang();

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <SosyalProse>
        <div>
          <p className="font-bold text-[var(--navy)]">{t(`${P}.frameTitle`)}</p>
          <p>{t(`${P}.frameBody`)}</p>
        </div>
        <div>
          <p className="font-bold text-[var(--navy)]">{t(`${P}.healthTitle`)}</p>
          <p>{t(`${P}.healthBody`)}</p>
        </div>
        <div>
          <p className="font-bold text-[var(--navy)]">{t(`${P}.aiTitle`)}</p>
          <p>{t(`${P}.aiBody`)}</p>
        </div>
        <div>
          <p className="font-bold text-[var(--navy)]">{t(`${P}.interTitle`)}</p>
          <p>{t(`${P}.interBody`)}</p>
        </div>
      </SosyalProse>
    </SosyalSection>
  );
}
