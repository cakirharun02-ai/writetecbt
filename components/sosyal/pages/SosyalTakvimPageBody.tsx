"use client";

import { useLang } from "@/components/LanguageProvider";
import { SosyalSection } from "@/components/sosyal/SosyalSection";

const ROWS = [0, 1, 2, 3, 4, 5, 6] as const;
const P = "pages.sosyal.takvim";
const EYEBROW = "pages.sosyal.eyebrow.congressInfo";

export function SosyalTakvimPageBody() {
  const { t } = useLang();

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <div className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white shadow-[0_14px_32px_rgba(11,45,90,0.05)]">
        {ROWS.map((i) => (
          <div
            key={i}
            className={[
              "grid grid-cols-1 gap-2 px-6 py-4 sm:grid-cols-[1.5fr_1fr] sm:items-center",
              i !== ROWS.length - 1 ? "border-b border-[var(--border-soft)]" : "",
            ].join(" ")}
          >
            <p className="font-semibold text-[var(--navy)]">{t(`${P}.row${i}label`)}</p>
            <p className="font-bold text-[var(--brand-blue)] sm:text-right">{t(`${P}.row${i}date`)}</p>
          </div>
        ))}
      </div>
    </SosyalSection>
  );
}
