"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { SOSYAL_BASE, SOSYAL_HOME } from "@/components/sosyal/nav";

const INSTAGRAM_URL = "https://www.instagram.com/writeteccongress/";
const WHATSAPP_URL =
  "https://api.whatsapp.com/send/?phone=905304718078&text=Merhaba%2C+kongre+hakk%C4%B1nda+bilgi+almak+istiyorum.&type=phone_number&app_absent=0";
const PHONE_DISPLAY = "+90 (530) 471 80 78";
const PHONE_TEL = "+905304718078";
const PHONE2_DISPLAY = "+90 530 349 39 32";
const PHONE2_TEL = "+905303493932";
const EMAIL = "writetecbt@gmail.com";
const ADDRESS =
  "Akdeniz Üniversitesi Antalya Teknokent Ar-Ge 2 Uluğbey Binası No:3A/B55 Konyaaltı / ANTALYA";

const QUICK_LINKS = [
  { key: "pages.sosyal.footer.quickHome", href: SOSYAL_HOME },
  { key: "pages.sosyal.footer.quickTakvim", href: `${SOSYAL_BASE}/takvim` },
  { key: "pages.sosyal.footer.quickKonular", href: `${SOSYAL_BASE}/konular` },
  { key: "pages.sosyal.footer.quickKayit", href: `${SOSYAL_BASE}/kayit-bilgisi` },
  { key: "pages.sosyal.footer.quickBasvuru", href: `${SOSYAL_BASE}/basvuru-formu` },
  { key: "pages.sosyal.footer.quickIletisim", href: `${SOSYAL_BASE}/iletisim` },
] as const;

export function SosyalFooter() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[var(--navy)] via-[var(--navy-2)] to-[var(--brand-blue)] text-white">
      <div
        className="anim-drift pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(800px 280px at 12% 18%, rgba(77,168,229,0.22) 0%, rgba(77,168,229,0) 55%), radial-gradient(700px 240px at 88% 18%, rgba(201,168,76,0.16) 0%, rgba(201,168,76,0) 60%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[var(--gold)] via-[var(--brand-sky)] to-transparent opacity-70" />

      <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <h3 className="font-display text-[20px] font-bold text-white">{t("pages.sosyal.footer.title")}</h3>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/72">{t("pages.sosyal.footer.about")}</p>
            <div className="mt-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                {t("pages.sosyal.footer.coursesTitle")}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
                <a
                  href="https://www.naakademi.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/75 transition-colors hover:text-[var(--gold-light)]"
                >
                  {t("pages.sosyal.footer.englishCourses")}
                </a>
                <a
                  href="https://www.nameslekikurslar.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/75 transition-colors hover:text-[var(--gold-light)]"
                >
                  {t("pages.sosyal.footer.vocationalCourses")}
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-display text-[18px] font-bold text-white">{t("pages.sosyal.footer.contactTitle")}</h3>
            <ul className="space-y-3 text-[14px] text-white/80">
              <li>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50">
                  {t("pages.sosyal.footer.addressLabel")}
                </span>
                <span className="font-semibold leading-snug">{ADDRESS}</span>
              </li>
              <li>
                <a href={`tel:${PHONE_TEL}`} className="transition-colors hover:text-[var(--gold-light)]">
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50">
                    {t("pages.sosyal.footer.phoneLabel")}
                  </span>
                  <span className="font-semibold">{PHONE_DISPLAY}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${PHONE2_TEL}`} className="transition-colors hover:text-[var(--gold-light)]">
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50">
                    {t("pages.sosyal.footer.phoneLabel")}
                  </span>
                  <span className="font-semibold">{PHONE2_DISPLAY}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="transition-colors hover:text-[var(--gold-light)]">
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50">
                    {t("pages.sosyal.footer.emailLabel")}
                  </span>
                  <span className="font-semibold">{EMAIL}</span>
                </a>
              </li>
            </ul>
            <div className="mt-5 flex items-center gap-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("pages.sosyal.footer.instagram")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:-translate-y-0.5 hover:border-[var(--gold)]/50"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("pages.sosyal.footer.whatsapp")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:-translate-y-0.5 hover:border-[#25D366]/60"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path d="M12.04 2.16c-5.46 0-9.9 4.44-9.9 9.91 0 1.74.46 3.43 1.32 4.93L2 22l5.13-1.34a9.86 9.86 0 0 0 4.91 1.25h.01c5.46 0 9.9-4.44 9.9-9.91 0-2.64-1.03-5.13-2.9-7-1.86-1.87-4.35-2.9-7-2.9zm4.74 11.91c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.59.13-.17.26-.67.85-.83 1.03-.15.17-.31.19-.57.06-.26-.13-1.1-.41-2.1-1.3-.78-.7-1.3-1.55-1.45-1.81-.15-.26-.02-.4.11-.53.11-.11.26-.31.39-.46.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.46-.06-.13-.59-1.42-.8-1.95-.21-.51-.43-.44-.59-.45h-.5c-.17 0-.45.06-.69.32-.24.26-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.69.13.17 1.83 2.79 4.43 3.91.62.27 1.1.43 1.48.55.62.2 1.18.17 1.63.1.5-.07 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.17-.5-.3z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-display text-[18px] font-bold text-white">{t("pages.sosyal.footer.quickTitle")}</h3>
            <ul className="space-y-2 text-[14px]">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-white/75 transition-colors hover:text-[var(--gold-light)]"
                  >
                    <span className="h-px w-3 bg-[var(--gold)]/70 transition-all group-hover:w-5" />
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
            <Link
              href="/"
              className="text-[12px] font-semibold text-white/55 transition-colors hover:text-[var(--gold-light)]"
            >
              {t("pages.sosyal.footer.backMain")}
            </Link>
            <p className="text-[12px] tracking-wide text-white/55">
              © {year} {t("pages.sosyal.footer.copyright")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
