"use client";

import { useLang } from "@/components/LanguageProvider";
import { SosyalSection } from "@/components/sosyal/SosyalSection";

const P = "pages.sosyal.konusmaci";
const EYEBROW = "pages.sosyal.eyebrow.congressInfo";
const C = "pages.sosyal.common";

export function SosyalKonusmaciPageBody() {
  const { t } = useLang();

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--border-soft)] bg-white px-6 py-8 text-center shadow-[0_14px_32px_rgba(11,45,90,0.05)]"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--brand-ice)] ring-4 ring-[var(--brand-ice)]">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--gray-soft)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" />
              </svg>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--gold)]/10 px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
              <span className="anim-pulse-ring inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
              {t(C + ".comingSoon")}
            </p>
          </div>
        ))}
      </div>
    </SosyalSection>
  );
}
