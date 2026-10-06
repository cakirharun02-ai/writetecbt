"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { SosyalSection } from "@/components/sosyal/SosyalSection";
import { SOSYAL_BASE } from "@/components/sosyal/nav";

const P = "pages.sosyal.basvuruSureci";
const EYEBROW = "pages.sosyal.eyebrow.application";

export function SosyalBasvuruSureciPageBody() {
  const { t } = useLang();

  const steps = [
    {
      title: t(`${P}.step1Title`),
      body: (
        <>
          <Link href={`${SOSYAL_BASE}/basvuru-formu`}>{t(`${P}.step1Link`)}</Link>
          {t(`${P}.step1After`)}
        </>
      ),
    },
    { title: t(`${P}.step2Title`), body: t(`${P}.step2Body`) },
    { title: t(`${P}.step3Title`), body: t(`${P}.step3Body`) },
    {
      title: t(`${P}.step4Title`),
      body: (
        <>
          {t(`${P}.step4Before`)}
          <Link href={`${SOSYAL_BASE}/kayit-bilgisi`}>{t(`${P}.step4Link`)}</Link>
          {t(`${P}.step4After`)}
        </>
      ),
    },
    {
      title: t(`${P}.step5Title`),
      body: (
        <>
          {t(`${P}.step5Before`)}
          <Link href={`${SOSYAL_BASE}/konaklama`}>{t(`${P}.step5Link`)}</Link>
          {t(`${P}.step5After`)}
        </>
      ),
    },
    {
      title: t(`${P}.step6Title`),
      body: (
        <>
          <strong>{t(`${P}.step6Reminder`)}</strong> {t(`${P}.step6Before`)}
          <Link href={`${SOSYAL_BASE}/takvim`}>{t(`${P}.step6LinkTakvim`)}</Link>
          {t(`${P}.step6After`)}
        </>
      ),
    },
  ];

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <p className="text-[15.5px] leading-relaxed text-[var(--gray)]">{t(`${P}.intro`)}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`${SOSYAL_BASE}/basvuru-formu`}
          className="rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-white transition-all hover:-translate-y-0.5"
        >
          {t(`${P}.ctaForm`)}
        </Link>
        <Link
          href={`${SOSYAL_BASE}/kayit-bilgisi`}
          className="rounded-full border border-[var(--navy)]/15 bg-white px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-[var(--navy)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-ice)]"
        >
          {t(`${P}.ctaKayit`)}
        </Link>
        <Link
          href={`${SOSYAL_BASE}/takvim`}
          className="rounded-full border border-[var(--navy)]/15 bg-white px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-[var(--navy)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-ice)]"
        >
          {t(`${P}.ctaTakvim`)}
        </Link>
      </div>

      <ol className="mt-8 space-y-4 [&_a]:font-semibold [&_a]:text-[var(--brand-blue)] [&_a:hover]:underline [&_strong]:text-[var(--navy)]">
        {steps.map((s) => (
          <li
            key={s.title}
            className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-[0_8px_22px_rgba(11,45,90,0.05)]"
          >
            <h3 className="font-display text-[17px] font-bold text-[var(--navy)]">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--gray)]">{s.body}</p>
          </li>
        ))}
      </ol>
    </SosyalSection>
  );
}
