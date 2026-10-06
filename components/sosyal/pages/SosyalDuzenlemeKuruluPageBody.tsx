"use client";

import { useLang } from "@/components/LanguageProvider";
import { SosyalSection } from "@/components/sosyal/SosyalSection";

const P = "pages.sosyal.duzenlemeKurulu";
const EYEBROW = "pages.sosyal.eyebrow.congressInfo";
const C = "pages.sosyal.common";

const CHAIR = { name: "Doç. Dr. Nihat ALTUNTEPE", org: "Isparta Uygulamalı Bilimler Üniversitesi" };

const MEMBERS = [
  { name: "Doç. Dr. Asım Sinan YÜKSEL", org: "Süleyman Demirel Üniversitesi" },
  { name: "Öğr. Gör. Harun ÇAKIR", org: "Isparta Uygulamalı Bilimler Üniversitesi" },
  { name: "Dr. Öğr. Üyesi Şerafettin SEVGİLİ", org: "Biruni Üniversitesi" },
  { name: "Dr. Öğr. Üyesi Yasemin TARCAN", org: "Süleyman Demirel Üniversitesi" },
  { name: "Dr. Öğr. Üyesi Hilal MOLA", org: "Atatürk Üniversitesi" },
];

function MemberCard({ name, org }: { name: string; org: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-soft)] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(11,45,90,0.05)]">
      <p className="font-semibold text-[var(--navy)]">{name}</p>
      <p className="mt-0.5 text-[13.5px] text-[var(--gray)]">{org}</p>
    </div>
  );
}

export function SosyalDuzenlemeKuruluPageBody() {
  const { t } = useLang();

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <h2 className="font-display text-[18px] font-bold text-[var(--navy)]">{t(`${P}.chairTitle`)}</h2>
      <div className="mt-3">
        <MemberCard {...CHAIR} />
      </div>

      <h2 className="mt-10 font-display text-[18px] font-bold text-[var(--navy)]">{t(`${P}.membersTitle`)}</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MEMBERS.map((m) => (
          <MemberCard key={m.name} {...m} />
        ))}
      </div>

      <h2 className="mt-10 font-display text-[18px] font-bold text-[var(--navy)]">{t(C + ".secretariat")}</h2>
      <p className="mt-3 font-semibold text-[var(--navy)]">{t(C + ".secretariatName")}</p>
    </SosyalSection>
  );
}
