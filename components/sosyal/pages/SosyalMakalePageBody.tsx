"use client";

import { useLang } from "@/components/LanguageProvider";
import { SosyalSection, SosyalProse } from "@/components/sosyal/SosyalSection";

const P = "pages.sosyal.makale";
const EYEBROW = "pages.sosyal.eyebrow.publications";

const OTHER_JOURNALS = [
  { name: "Marmara Sosyal Araştırmalar Dergisi", url: "https://dergipark.org.tr/tr/pub/marusad" },
  { name: "Uygulamalı Sosyal Bilimler ve Güzel Sanatlar Dergisi (SOSGÜZ)", url: "https://dergipark.org.tr/tr/pub/sosguz" },
  { name: "Süleyman Demirel Üniversitesi İnsan Kaynakları Yönetimi Dergisi (SDUIKYD)", url: "https://dergipark.org.tr/tr/pub/sduikyd" },
  { name: "Econder Uluslararası Akademik Dergisi", url: "https://dergipark.org.tr/tr/pub/econder" },
  { name: "Studies On Social Science Insights (SOSSCI)", url: "https://www.sossci.org/SonSayi.Aspx" },
];

export function SosyalMakalePageBody() {
  const { t } = useLang();

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <SosyalProse>
        <p>{t(`${P}.intro`)}</p>

        <div>
          <p className="font-bold text-[var(--navy)]">{t(`${P}.scopusTitle`)}</p>
          <p>
            {t(`${P}.scopusJournal`)}
            <br />
            <a href="https://dergipark.org.tr/en/pub/uiecd" target="_blank" rel="noopener noreferrer">
              https://dergipark.org.tr/en/pub/uiecd
            </a>
          </p>
          <p>{t(`${P}.scopusNote`)}</p>
        </div>

        <div>
          <p className="font-bold text-[var(--navy)]">{t(`${P}.trDizinTitle`)}</p>
          <p>
            {t(`${P}.trDizinJournal`)}
            <br />
            <a href="https://dergipark.org.tr/tr/pub/itobiad" target="_blank" rel="noopener noreferrer">
              https://dergipark.org.tr/tr/pub/itobiad
            </a>
          </p>
        </div>

        <div>
          <p className="font-bold text-[var(--navy)]">{t(`${P}.otherTitle`)}</p>
          <p>{t(`${P}.otherIntro`)}</p>
          <ul className="mt-3 space-y-3">
            {OTHER_JOURNALS.map((j) => (
              <li key={j.url}>
                <span className="block text-[var(--navy)]">{j.name}</span>
                <a href={j.url} target="_blank" rel="noopener noreferrer">
                  {j.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </SosyalProse>
    </SosyalSection>
  );
}
