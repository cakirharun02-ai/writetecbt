"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { SosyalSection, SosyalProse } from "@/components/sosyal/SosyalSection";
import { SOSYAL_BASE } from "@/components/sosyal/nav";

const P = "pages.sosyal.katilimKurallari";
const EYEBROW = "pages.sosyal.eyebrow.application";

export function SosyalKatilimKurallariPageBody() {
  const { t } = useLang();

  const rules: React.ReactNode[] = [
    t(`${P}.rule1`),
    t(`${P}.rule2`),
    t(`${P}.rule3`),
    t(`${P}.rule4`),
    t(`${P}.rule5`),
    <>
      {t(`${P}.rule6Before`)}
      <Link href={`${SOSYAL_BASE}/basvuru-formu`}>{t(`${P}.rule6Link`)}</Link>
      {t(`${P}.rule6After`)}
    </>,
    t(`${P}.rule7`),
    t(`${P}.rule8`),
    t(`${P}.rule9`),
    t(`${P}.rule10`),
  ];

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <SosyalProse>
        <p>{t(`${P}.intro`)}</p>
        <p className="font-bold text-[var(--navy)]">{t(`${P}.conditionsTitle`)}</p>
        <ol className="space-y-3">
          {rules.map((r, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] text-[13px] font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-0.5">{r}</span>
            </li>
          ))}
        </ol>
      </SosyalProse>
    </SosyalSection>
  );
}
