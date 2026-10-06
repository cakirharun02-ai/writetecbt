"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { SosyalSection, SosyalProse } from "@/components/sosyal/SosyalSection";
import { SOSYAL_BASE } from "@/components/sosyal/nav";

const P = "pages.sosyal.basvuruFormu";
const EYEBROW = "pages.sosyal.eyebrow.application";

const WHATSAPP_URL =
  "https://api.whatsapp.com/send/?phone=905304718078&text=Merhaba%2C+kongre+ba%C5%9Fvurusu+hakk%C4%B1nda+bilgi+almak+istiyorum.&type=phone_number&app_absent=0";

export function SosyalBasvuruFormuPageBody() {
  const { t } = useLang();

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <SosyalProse>
        <p>
          {t(`${P}.introBefore`)}
          <Link href={`${SOSYAL_BASE}/basvuru-sureci`}>{t(`${P}.introLink`)}</Link>
          {t(`${P}.introAfter`)}
        </p>
      </SosyalProse>

      <div className="mt-7 rounded-2xl border border-[var(--border-soft)] bg-white p-7 shadow-[0_14px_32px_rgba(11,45,90,0.06)]">
        <h2 className="font-display text-[20px] font-bold text-[var(--navy)]">{t(`${P}.formTitle`)}</h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--gray)]">{t(`${P}.formHint`)}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={`${SOSYAL_BASE}/basvuru-formu/form`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_14px_30px_rgba(11,45,90,0.25)] transition-all hover:-translate-y-0.5"
          >
            {t(`${P}.openForm`)}
          </a>
          <a
            href="/saglik/yazimkurallari.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--navy)]/15 bg-white px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--navy)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-ice)]"
          >
            {t(`${P}.writingRules`)}
          </a>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] p-7 text-white">
        <h2 className="font-display text-[19px] font-bold">{t(`${P}.contactTitle`)}</h2>
        <p className="mt-2 text-[14.5px] text-white/85">{t(`${P}.contactHint`)}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="mailto:writetecbt@gmail.com"
            className="rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-[var(--navy)] transition-transform hover:-translate-y-0.5"
          >
            writetecbt@gmail.com
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-[13.5px] font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            {t(`${P}.whatsapp`)}
          </a>
        </div>
      </div>
    </SosyalSection>
  );
}
