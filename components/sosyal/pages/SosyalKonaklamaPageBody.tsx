"use client";

import { useLang } from "@/components/LanguageProvider";
import { SosyalSection, SosyalProse } from "@/components/sosyal/SosyalSection";

const P = "pages.sosyal.konaklama";
const EYEBROW = "pages.sosyal.eyebrow.registration";

function RoomTable({
  title,
  deadline,
  single,
  double,
  triple,
  external,
  t,
}: {
  title: string;
  deadline: string;
  single: string;
  double: string;
  triple: string;
  external: string;
  t: (key: string) => string;
}) {
  const rows: Array<[string, string]> = [
    [t(`${P}.roomSingle`), single],
    [t(`${P}.roomDouble`), double],
    [t(`${P}.roomTriple`), triple],
    [t(`${P}.roomExternal`), external],
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white shadow-[0_14px_32px_rgba(11,45,90,0.06)]">
      <div className="bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] px-6 py-4 text-center font-display text-[18px] font-bold text-white">
        {title}
      </div>
      <table className="w-full text-[15px]">
        <thead>
          <tr>
            <th className="bg-[var(--brand-ice)]/50 px-5 py-3 text-left font-semibold text-[var(--navy)]">
              {t(`${P}.roomTypeLabel`)}
            </th>
            <th className="bg-[var(--brand-ice)]/50 px-5 py-3 text-right font-semibold text-[var(--navy)]">
              {t(`${P}.totalLabel`)}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-soft)]">
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td className="px-5 py-3 font-semibold text-[var(--navy)]">{label}</td>
              <td className="px-5 py-3 text-right font-bold text-[var(--brand-blue)]">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-[var(--border-soft)] bg-[var(--brand-ice)]/30 px-5 py-3 text-center text-[13.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy)]">
        {deadline}
      </div>
    </div>
  );
}

export function SosyalKonaklamaPageBody() {
  const { t } = useLang();

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <SosyalProse>
        <p>{t(`${P}.intro`)}</p>
        <p>{t(`${P}.priceNote`)}</p>
      </SosyalProse>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RoomTable
          title={t(`${P}.earlyTitle`)}
          deadline={t(`${P}.earlyDeadline`)}
          single={t(`${P}.earlySingle`)}
          double={t(`${P}.earlyDouble`)}
          triple={t(`${P}.earlyTriple`)}
          external={t(`${P}.earlyExternal`)}
          t={t}
        />
        <RoomTable
          title={t(`${P}.lateTitle`)}
          deadline={t(`${P}.lateDeadline`)}
          single={t(`${P}.lateSingle`)}
          double={t(`${P}.lateDouble`)}
          triple={t(`${P}.lateTriple`)}
          external={t(`${P}.lateExternal`)}
          t={t}
        />
      </div>

      <div className="mt-6 rounded-xl border border-[var(--border-soft)] bg-[var(--brand-ice)]/40 px-5 py-4">
        <p className="text-[14.5px] font-semibold text-[var(--navy)]">{t(`${P}.childNote`)}</p>
      </div>

      <div className="mt-8 rounded-2xl bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] p-7 text-white">
        <h2 className="font-display text-[19px] font-bold">{t(`${P}.hotelTitle`)}</h2>
        <p className="mt-3 text-[15.5px] font-semibold">{t(`${P}.hotelName`)}</p>
        <a
          href="tel:+905435439648"
          className="mt-1 inline-block text-[15.5px] font-semibold text-[var(--gold-light)] hover:underline"
        >
          {t(`${P}.hotelPhone`)}
        </a>
      </div>
    </SosyalSection>
  );
}
