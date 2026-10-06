"use client";

import { useLang } from "@/components/LanguageProvider";
import { SosyalSection, SosyalProse } from "@/components/sosyal/SosyalSection";

const P = "pages.sosyal.yukselmeTesvik";
const EYEBROW = "pages.sosyal.eyebrow.congressInfo";

export function SosyalYukselmeTesvikPageBody() {
  const { t } = useLang();

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <SosyalProse>
        <p>{t(`${P}.intro`)}</p>
        <div>
          <p className="font-bold text-[var(--navy)]">{t(`${P}.incentiveTitle`)}</p>
          <p>{t(`${P}.incentiveBody`)}</p>
        </div>
        <div>
          <p className="font-bold text-[var(--navy)]">{t(`${P}.evalTitle`)}</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>{t(`${P}.evalLi1`)}</li>
            <li>{t(`${P}.evalLi2`)}</li>
            <li>{t(`${P}.evalLi3`)}</li>
            <li>{t(`${P}.evalLi4`)}</li>
          </ul>
        </div>
      </SosyalProse>
    </SosyalSection>
  );
}
