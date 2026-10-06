"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { SosyalSection, SosyalProse } from "@/components/sosyal/SosyalSection";
import { SOSYAL_BASE } from "@/components/sosyal/nav";

const P = "pages.sosyal.kayitBilgisi";
const EYEBROW = "pages.sosyal.eyebrow.registration";

function FeeTable({
  title,
  type,
  single,
  double,
  deadline,
  t,
}: {
  title: string;
  type?: string;
  single: string;
  double: string;
  deadline: string;
  t: (key: string) => string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white shadow-[0_14px_32px_rgba(11,45,90,0.06)]">
      <div className="bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] px-6 py-4 text-center font-display text-[18px] font-bold text-white">
        {title}
      </div>
      <table className="w-full text-[15px]">
        <tbody className="divide-y divide-[var(--border-soft)]">
          {type && (
            <tr>
              <th className="w-1/2 bg-[var(--brand-ice)]/50 px-5 py-3 text-left font-semibold text-[var(--navy)]">
                {t(`${P}.feeType`)}
              </th>
              <td className="px-5 py-3 text-center font-semibold text-[var(--navy)]" colSpan={2}>
                {type}
              </td>
            </tr>
          )}
          <tr>
            <th className="bg-[var(--brand-ice)]/50 px-5 py-3 text-left font-semibold text-[var(--navy)]">
              {t(`${P}.feePapers`)}
            </th>
            <td className="px-5 py-3 text-center font-semibold text-[var(--brand-blue)]">{t(`${P}.feeSingle`)}</td>
            <td className="px-5 py-3 text-center font-semibold text-[var(--brand-blue)]">{t(`${P}.feeDouble`)}</td>
          </tr>
          <tr>
            <th className="bg-[var(--brand-ice)]/50 px-5 py-3 text-left font-semibold text-[var(--navy)]">
              {t(`${P}.feeAmount`)}
            </th>
            <td className="px-5 py-3 text-center font-bold text-[var(--navy)]">{single}</td>
            <td className="px-5 py-3 text-center font-bold text-[var(--navy)]">{double}</td>
          </tr>
          <tr>
            <th className="bg-[var(--brand-ice)]/50 px-5 py-3 text-left font-semibold text-[var(--navy)]">
              {t(`${P}.feeDeadline`)}
            </th>
            <td className="px-5 py-3 text-center font-bold text-[var(--navy)]" colSpan={2}>
              {deadline}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function AccountImage({ title, src }: { title: string; src: string }) {
  return (
    <div>
      <p className="mb-2 font-bold text-[var(--navy)]">{title}</p>
      <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-white p-2 shadow-[0_8px_22px_rgba(11,45,90,0.06)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={title} className="w-full max-w-xl" />
      </div>
    </div>
  );
}

export function SosyalKayitBilgisiPageBody() {
  const { t } = useLang();

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FeeTable
          title={t(`${P}.earlyTitle`)}
          single={t(`${P}.earlySingle`)}
          double={t(`${P}.earlyDouble`)}
          deadline={t(`${P}.earlyDeadline`)}
          t={t}
        />
        <FeeTable
          title={t(`${P}.lateTitle`)}
          type={t(`${P}.lateType`)}
          single={t(`${P}.lateSingle`)}
          double={t(`${P}.lateDouble`)}
          deadline={t(`${P}.lateDeadline`)}
          t={t}
        />
      </div>

      <div className="mt-8">
        <SosyalProse>
          <p>{t(`${P}.note1`)}</p>
        </SosyalProse>
      </div>

      <h2 className="mt-10 font-display text-[20px] font-bold text-[var(--navy)]">{t(`${P}.accountsTitle`)}</h2>
      <div className="mt-5 space-y-7">
        <AccountImage title={t(`${P}.accountTry`)} src="/saglik/hesap1.png" />
        <AccountImage title={t(`${P}.accountUsd`)} src="/saglik/hesap2.png" />
        <AccountImage title={t(`${P}.accountSwift`)} src="/saglik/hesap3.png" />
      </div>

      <div className="mt-10">
        <SosyalProse>
          <p className="font-bold text-[var(--navy)]">{t(`${P}.onlineTitle`)}</p>
          <p>{t(`${P}.onlineP1`)}</p>
          <p>{t(`${P}.onlineP2`)}</p>
          <div>
            <p className="font-bold text-[var(--navy)]">{t(`${P}.cancelTitle`)}</p>
            <p>
              {t(`${P}.cancelP1Before`)}
              <Link href={`${SOSYAL_BASE}/takvim`}>{t(`${P}.cancelLink`)}</Link>
              {t(`${P}.cancelP1After`)}
            </p>
          </div>
          <p>{t(`${P}.onlineP3`)}</p>
          <p>{t(`${P}.onlineP4`)}</p>
          <p>
            <strong>{t(`${P}.importantNote`)}</strong>
          </p>
        </SosyalProse>
      </div>
    </SosyalSection>
  );
}
