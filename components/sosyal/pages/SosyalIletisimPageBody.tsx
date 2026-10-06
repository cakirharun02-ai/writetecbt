"use client";

import { useLang } from "@/components/LanguageProvider";
import { SosyalSection } from "@/components/sosyal/SosyalSection";

const P = "pages.sosyal.iletisim";
const EYEBROW = "pages.sosyal.eyebrow.contact";

const WHATSAPP_URL =
  "https://api.whatsapp.com/send/?phone=905304718078&text=Merhaba%2C+kongre+hakk%C4%B1nda+bilgi+almak+istiyorum.&type=phone_number&app_absent=0";
const INSTAGRAM_URL = "https://www.instagram.com/writeteccongress/";
const ADDRESS =
  "Akdeniz Üniversitesi Antalya Teknokent Ar-Ge 2 Uluğbey Binası No:3A/B55 Konyaaltı / ANTALYA";

export function SosyalIletisimPageBody() {
  const { t } = useLang();

  return (
    <SosyalSection eyebrow={t(EYEBROW)} title={t(`${P}.title`)}>
      <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-7 shadow-[0_14px_32px_rgba(11,45,90,0.06)]">
        <p className="font-bold text-[var(--navy)]">{t(`${P}.heading`)}</p>
        <div className="mt-4 space-y-3 text-[16px]">
          <a href="mailto:writetecbt@gmail.com" className="block font-semibold text-[var(--brand-blue)] hover:underline">
            writetecbt@gmail.com
          </a>
          <a href="tel:+905304718078" className="block font-semibold text-[var(--brand-blue)] hover:underline">
            +90 (530) 471 80 78
          </a>
          <a href="tel:+905303493932" className="block font-semibold text-[var(--brand-blue)] hover:underline">
            +90 530 349 39 32
          </a>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
              {t(`${P}.addressLabel`)}
            </span>
            <span className="mt-1 block font-semibold leading-snug text-[var(--navy)]">{ADDRESS}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-6 py-3 text-[13.5px] font-bold text-white shadow-[0_12px_26px_rgba(37,211,102,0.3)] transition-transform hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M12.04 2.16c-5.46 0-9.9 4.44-9.9 9.91 0 1.74.46 3.43 1.32 4.93L2 22l5.13-1.34a9.86 9.86 0 0 0 4.91 1.25h.01c5.46 0 9.9-4.44 9.9-9.91 0-2.64-1.03-5.13-2.9-7-1.86-1.87-4.35-2.9-7-2.9zm4.74 11.91c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.59.13-.17.26-.67.85-.83 1.03-.15.17-.31.19-.57.06-.26-.13-1.1-.41-2.1-1.3-.78-.7-1.3-1.55-1.45-1.81-.15-.26-.02-.4.11-.53.11-.11.26-.31.39-.46.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.46-.06-.13-.59-1.42-.8-1.95-.21-.51-.43-.44-.59-.45h-.5c-.17 0-.45.06-.69.32-.24.26-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.69.13.17 1.83 2.79 4.43 3.91.62.27 1.1.43 1.48.55.62.2 1.18.17 1.63.1.5-.07 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.17-.5-.3z" />
            </svg>
            {t(`${P}.whatsapp`)}
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] px-6 py-3 text-[13.5px] font-bold text-white shadow-[0_12px_26px_rgba(221,42,123,0.3)] transition-transform hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
            </svg>
            {t(`${P}.instagram`)}
          </a>
        </div>
      </div>
    </SosyalSection>
  );
}
