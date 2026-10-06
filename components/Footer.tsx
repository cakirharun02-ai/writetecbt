"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

const NAV_LINKS = [
  { key: "nav.home", href: "/" },
  { key: "nav.corporate", href: "/kurumsal" },
  { key: "nav.about", href: "/hakkimizda" },
  { key: "nav.congresses", href: "/kongrelerimiz" },
  { key: "nav.contact", href: "/iletisim" },
];

const CONGRESS_LINKS = [
  { key: "series.sosyalSaglik.title", href: "/kongrelerimiz/sosyal-saglik" },
  { key: "series.muhendislik.title", href: "/kongrelerimiz/muhendislik" },
] as const;

const PUBLICATION_LINKS = [
  { key: "publications.dergi.title", href: "/yayin-imkanlari/dergi" },
  { key: "publications.kitap.title", href: "/yayin-imkanlari/kitap" },
  { key: "publications.bildiri.title", href: "/yayin-imkanlari/bildiri" },
] as const;

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

function IconInstagram({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconWhatsApp({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12.04 2.16c-5.46 0-9.9 4.44-9.9 9.91 0 1.74.46 3.43 1.32 4.93L2 22l5.13-1.34a9.86 9.86 0 0 0 4.91 1.25h.01c5.46 0 9.9-4.44 9.9-9.91 0-2.64-1.03-5.13-2.9-7-1.86-1.87-4.35-2.9-7-2.9zm0 18.07h-.01a8.18 8.18 0 0 1-4.18-1.15l-.3-.18-2.96.78.79-2.89-.2-.31a8.16 8.16 0 0 1-1.26-4.4c0-4.53 3.7-8.22 8.23-8.22 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.81c0 4.53-3.7 8.22-8.22 8.22zm4.74-6.16c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.59.13-.17.26-.67.85-.83 1.03-.15.17-.31.19-.57.06-.26-.13-1.1-.41-2.1-1.3-.78-.7-1.3-1.55-1.45-1.81-.15-.26-.02-.4.11-.53.11-.11.26-.31.39-.46.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.46-.06-.13-.59-1.42-.8-1.95-.21-.51-.43-.44-.59-.45h-.5c-.17 0-.45.06-.69.32-.24.26-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.69.13.17 1.83 2.79 4.43 3.91.62.27 1.1.43 1.48.55.62.2 1.18.17 1.63.1.5-.07 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.17-.5-.3z" />
    </svg>
  );
}

function IconPhone({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.32 1.9.6 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.28 1.85.48 2.81.6A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconMapPin({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconMail({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 6L2 7" />
    </svg>
  );
}

type FooterLinkItem = { key: string; href: string };

function FooterLinkColumn({
  title,
  links,
  t,
}: {
  title: string;
  links: readonly FooterLinkItem[];
  t: (key: string) => string;
}) {
  return (
    <div>
      <h3 className="mb-3 font-display text-[15px] font-bold leading-snug text-white">
        {title}
      </h3>
      <ul className="space-y-1.5 text-[13px]">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group inline-flex items-start gap-2 text-white/75 transition-colors hover:text-[var(--gold-light)]"
            >
              <span className="mt-2 h-px w-3 flex-shrink-0 bg-[var(--gold)]/70 transition-all group-hover:w-5 group-hover:bg-[var(--gold-light)]" />
              <span className="leading-snug">{t(item.key)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[var(--navy)] via-[var(--navy-2)] to-[var(--brand-blue)] text-white">
      <div
        className="anim-drift pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(800px 280px at 12% 18%, rgba(77,168,229,0.22) 0%, rgba(77,168,229,0) 55%), radial-gradient(700px 240px at 88% 18%, rgba(201,168,76,0.16) 0%, rgba(201,168,76,0) 60%), radial-gradient(700px 260px at 60% 110%, rgba(77,168,229,0.16) 0%, rgba(77,168,229,0) 60%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[var(--gold)] via-[var(--brand-sky)] to-transparent opacity-70" />

      <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-5 lg:gap-8">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div>
              <p className="font-display text-[22px] font-bold leading-tight text-white">
                {t("brand.name")}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">
                {t("brand.kicker")}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              {t("brand.tagline")}
            </p>

            <div className="border-t border-white/10 pt-4">
              <h3 className="mb-3 font-display text-[15px] font-bold text-white">
                {t("footer.quickTitle")}
              </h3>
              <ul className="space-y-1.5 text-[13px]">
                {NAV_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-2 text-white/75 transition-colors hover:text-[var(--gold-light)]"
                    >
                      <span className="h-px w-3 bg-[var(--gold)]/70 transition-all group-hover:w-5 group-hover:bg-[var(--gold-light)]" />
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-4 py-2 text-[13px] font-semibold text-white transition-all hover:border-[var(--gold)]/70 hover:bg-[var(--gold)]/20"
            >
              {t("footer.ctaContact")}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>

          <FooterLinkColumn title={t("footer.congressesTitle")} links={CONGRESS_LINKS} t={t} />
          <FooterLinkColumn title={t("footer.publicationsTitle")} links={PUBLICATION_LINKS} t={t} />

          <div>
            <h3 className="mb-3 font-display text-[18px] font-bold text-white">
              {t("footer.aboutTitle")}
            </h3>
            <p className="text-[14px] leading-relaxed text-white/72">
              {t("footer.aboutBody")}
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-display text-[18px] font-bold text-white">
              {t("footer.contactTitle")}
            </h3>
            <ul className="space-y-3 text-[14px] text-white/80">
              <li>
                <div className="group inline-flex items-start gap-2.5">
                  <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                    <IconMapPin />
                  </span>
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50">
                      {t("footer.addressLabel")}
                    </span>
                    <span className="font-semibold leading-snug">{ADDRESS}</span>
                  </span>
                </div>
              </li>
              <li>
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="group inline-flex items-center gap-2.5 transition-colors hover:text-[var(--gold-light)]"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 transition-colors group-hover:bg-[var(--gold)]/20 group-hover:ring-[var(--gold)]/40">
                    <IconPhone />
                  </span>
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50">
                      {t("footer.phoneLabel")}
                    </span>
                    <span className="font-semibold">{PHONE_DISPLAY}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${PHONE2_TEL}`}
                  className="group inline-flex items-center gap-2.5 transition-colors hover:text-[var(--gold-light)]"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 transition-colors group-hover:bg-[var(--gold)]/20 group-hover:ring-[var(--gold)]/40">
                    <IconPhone />
                  </span>
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50">
                      {t("footer.phoneLabel")}
                    </span>
                    <span className="font-semibold">{PHONE2_DISPLAY}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="group inline-flex items-center gap-2.5 transition-colors hover:text-[var(--gold-light)]"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 transition-colors group-hover:bg-[var(--gold)]/20 group-hover:ring-[var(--gold)]/40">
                    <IconMail />
                  </span>
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50">
                      {t("footer.emailLabel")}
                    </span>
                    <span className="font-semibold">{EMAIL}</span>
                  </span>
                </a>
              </li>
            </ul>

            <div className="mt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                {t("footer.followTitle")}
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:-translate-y-0.5 hover:border-[var(--gold)]/50 hover:bg-gradient-to-br hover:from-[#f58529]/30 hover:to-[#dd2a7b]/30 hover:text-white"
                >
                  <IconInstagram />
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:-translate-y-0.5 hover:border-[#25D366]/60 hover:bg-[#25D366]/20 hover:text-white"
                >
                  <IconWhatsApp />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
            <p className="text-[13px] text-white/70">
              {t("footer.tagline")}
            </p>
            <p className="text-[12px] tracking-wide text-white/55">
              {year} {t("footer.copyright")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
