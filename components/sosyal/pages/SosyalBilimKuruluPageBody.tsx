"use client";

import { useLang } from "@/components/LanguageProvider";
import { SosyalSection } from "@/components/sosyal/SosyalSection";

const P = "pages.sosyal.bilimKurulu";
const EYEBROW = "pages.sosyal.eyebrow.congressInfo";
const C = "pages.sosyal.common";

const MEMBERS = [
  { name: "Prof. Dr. Azah Kamilah DRAMAN", org: "Universiti Teknikal Malaysia Melaka" },
  { name: "Prof. Dr. Sumru BAKAN", org: "Kilis 7 Aralık Üniversitesi" },
  { name: "Prof. Dr. Berna BALCI İZGİ", org: "Gaziantep Üniversitesi" },
  { name: "Prof. Dr. Özgür DEMİRTAŞ", org: "Kayseri Üniversitesi" },
  { name: "Prof. Dr. Mehmet Fatih BAYRAMOĞLU", org: "Zonguldak Bülent Ecevit Üniversitesi" },
  { name: "Prof. Dr. Murat KAYALAR", org: "Burdur Mehmet Akif Üniversitesi" },
  { name: "Prof. Dr. Aziz BOSTAN", org: "Aydın Adnan Menderes Üniversitesi" },
  { name: "Prof. Dr. Haktan SEVİNÇ", org: "Iğdır Üniversitesi" },
  { name: "Prof. Dr. Necmiye CÖMERTLER", org: "Aydın Adnan Menderes Üniversitesi" },
  { name: "Prof. Dr. Özcan SEZER", org: "Zonguldak Bülent Ecevit Üniversitesi" },
  { name: "Prof. Dr. Hidayet Gizem ÜNLÜ ÖREN", org: "Süleyman Demirel Üniversitesi" },
  { name: "Assoc. Prof. Dr. Waidah BINTI ISMAIL", org: "Universiti Sains Islam Malaysia" },
  { name: "Doç. Dr. Rukiye TÜRK DELİBALTA", org: "Kafkas Üniversitesi" },
  { name: "Doç. Dr. Musa ÖZTÜRK", org: "Isparta Uygulamalı Bilimler Üniversitesi" },
  { name: "Doç. Dr. Mustafa KIRCA", org: "Ordu Üniversitesi" },
  { name: "Doç. Dr. Asım Sinan YÜKSEL", org: "Süleyman Demirel Üniversitesi" },
  { name: "Doç. Dr. Adem BABACAN", org: "Sivas Cumhuriyet Üniversitesi" },
  { name: "Doç. Dr. Emre SAYGIN", org: "Eskişehir Osmangazi Üniversitesi" },
  { name: "Doç. Dr. Murat BAŞ", org: "Erzincan Binali Yıldırım Üniversitesi" },
  { name: "Doç. Dr. Özcan DEMİR", org: "Fırat Üniversitesi" },
  { name: "Doç. Dr. Ümit YILDIZ", org: "Bayburt Üniversitesi" },
  { name: "Doç. Dr. Mesut BALIBEY", org: "Tarım ve Orman Bakanlığı" },
  { name: "Doç. Dr. Zafer ÖZTÜRK", org: "Zonguldak Bülent Ecevit Üniversitesi" },
  { name: "Doç. Dr. Selim KANAT", org: "Süleyman Demirel Üniversitesi" },
  { name: "Dr. Öğr. Üyesi Sevda Pınar MEHEL TUTUK", org: "İstanbul Şişli Meslek Yüksekokulu" },
  { name: "Dr. Öğr. Üyesi Meltem DOĞAN", org: "İstanbul Şişli Meslek Yüksekokulu" },
  { name: "Dr. Öğr. Üyesi Hilal MOLA", org: "Atatürk Üniversitesi" },
  { name: "Dr. Magsud MİRZAYEV", org: "Azerbaycan Devlet İktisat Üniversitesi" },
  { name: "Dr. Mehtap ETER", org: "Sağlık Bakanlığı" },
  { name: "Dr. Meltem ÇAPAR ÇİFTÇİ", org: "Sağlık Bakanlığı" },
  { name: "Ms. Ansa Javed KHAN", org: "Bacha Khan University Charsadda, Khyber Pakhtunkhwa, Pakistan" },
];

export function SosyalBilimKuruluPageBody() {
  const { t } = useLang();

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MEMBERS.map((m) => (
          <div
            key={m.name}
            className="rounded-xl border border-[var(--border-soft)] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(11,45,90,0.05)]"
          >
            <p className="font-semibold text-[var(--navy)]">{m.name}</p>
            <p className="mt-0.5 text-[13.5px] text-[var(--gray)]">{m.org}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-[18px] font-bold text-[var(--navy)]">{t(C + ".secretariat")}</h2>
      <p className="mt-3 font-semibold text-[var(--navy)]">{t(C + ".secretariatName")}</p>
    </SosyalSection>
  );
}
