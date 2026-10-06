"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

const PHONE_DISPLAY = "+90 (530) 471 80 78";
const PHONE_TEL = "+905304718078";
const PHONE2_DISPLAY = "+90 530 349 39 32";
const PHONE2_TEL = "+905303493932";
const EMAIL = "writetecbt@gmail.com";
const ADDRESS =
  "Akdeniz Üniversitesi Antalya Teknokent Ar-Ge 2 Uluğbey Binası No:3A/B55 Konyaaltı / ANTALYA";
const INSTAGRAM_URL = "https://www.instagram.com/writeteccongress/";
const WHATSAPP_URL =
  "https://api.whatsapp.com/send/?phone=905304718078&text=Merhaba%2C+kongre+hakk%C4%B1nda+bilgi+almak+istiyorum.&type=phone_number&app_absent=0";

export function ContactPageBody() {
  const { t } = useLang();
  return (
    <section className="relative isolate overflow-hidden bg-[var(--cream)]">
      <div
        className="pointer-events-none absolute -left-32 top-12 h-72 w-72 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(77,168,229,0.16) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-12 h-80 w-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-24">
        <p className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--gold)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
          {t("pages.iletisim.eyebrow")}
        </p>
        <h1
          className="anim-fade-up mt-5 font-display text-[clamp(32px,5vw,52px)] font-bold leading-tight text-[var(--navy)]"
          style={{ animationDelay: "120ms" }}
        >
          {t("pages.iletisim.title")}
        </h1>
        <p
          className="anim-fade-up mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--gray)]"
          style={{ animationDelay: "220ms" }}
        >
          {t("pages.iletisim.lead")}
        </p>

        <div
          className="anim-fade-up mt-10 grid gap-4 sm:grid-cols-2"
          style={{ animationDelay: "320ms" }}
        >
          <a
            href={`tel:${PHONE_TEL}`}
            className="group flex items-center gap-4 rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-[0_10px_24px_rgba(11,45,90,0.06)] transition-all hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/40 hover:shadow-[0_18px_36px_rgba(11,45,90,0.12)]"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(11,45,90,0.22)]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.32 1.9.6 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.28 1.85.48 2.81.6A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <span className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                {t("footer.phoneLabel")}
              </span>
              <span className="font-display text-[17px] font-bold text-[var(--navy)]">
                {PHONE_DISPLAY}
              </span>
            </span>
          </a>

          <a
            href={`tel:${PHONE2_TEL}`}
            className="group flex items-center gap-4 rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-[0_10px_24px_rgba(11,45,90,0.06)] transition-all hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/40 hover:shadow-[0_18px_36px_rgba(11,45,90,0.12)]"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(11,45,90,0.22)]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.32 1.9.6 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.28 1.85.48 2.81.6A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <span className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                {t("footer.phoneLabel")}
              </span>
              <span className="font-display text-[17px] font-bold text-[var(--navy)]">
                {PHONE2_DISPLAY}
              </span>
            </span>
          </a>

          <a
            href={`mailto:${EMAIL}`}
            className="group flex items-center gap-4 rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-[0_10px_24px_rgba(11,45,90,0.06)] transition-all hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/40 hover:shadow-[0_18px_36px_rgba(11,45,90,0.12)]"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(11,45,90,0.22)]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 6L2 7" />
              </svg>
            </span>
            <span className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                {t("footer.emailLabel")}
              </span>
              <span className="font-display text-[17px] font-bold text-[var(--navy)]">
                {EMAIL}
              </span>
            </span>
          </a>

          <div className="group flex items-center gap-4 rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-[0_10px_24px_rgba(11,45,90,0.06)] sm:col-span-2">
            <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(11,45,90,0.22)]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <span className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                {t("footer.addressLabel")}
              </span>
              <span className="font-display text-[16px] font-bold leading-snug text-[var(--navy)]">
                {ADDRESS}
              </span>
            </span>
          </div>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-[0_10px_24px_rgba(11,45,90,0.06)] transition-all hover:-translate-y-0.5 hover:border-[var(--gold)]/40 hover:shadow-[0_18px_36px_rgba(11,45,90,0.12)]"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white shadow-[0_10px_22px_rgba(221,42,123,0.30)]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <span className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                Instagram
              </span>
              <span className="font-display text-[17px] font-bold text-[var(--navy)]">
                @writeteccongress
              </span>
            </span>
          </a>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-[0_10px_24px_rgba(11,45,90,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#25D366]/50 hover:shadow-[0_18px_36px_rgba(37,211,102,0.18)]"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_22px_rgba(37,211,102,0.32)]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12.04 2.16c-5.46 0-9.9 4.44-9.9 9.91 0 1.74.46 3.43 1.32 4.93L2 22l5.13-1.34a9.86 9.86 0 0 0 4.91 1.25h.01c5.46 0 9.9-4.44 9.9-9.91 0-2.64-1.03-5.13-2.9-7-1.86-1.87-4.35-2.9-7-2.9zm4.74 14.07c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.59.13-.17.26-.67.85-.83 1.03-.15.17-.31.19-.57.06-.26-.13-1.1-.41-2.1-1.3-.78-.7-1.3-1.55-1.45-1.81-.15-.26-.02-.4.11-.53.11-.11.26-.31.39-.46.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.46-.06-.13-.59-1.42-.8-1.95-.21-.51-.43-.44-.59-.45h-.5c-.17 0-.45.06-.69.32-.24.26-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.69.13.17 1.83 2.79 4.43 3.91.62.27 1.1.43 1.48.55.62.2 1.18.17 1.63.1.5-.07 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.17-.5-.3z" />
              </svg>
            </span>
            <span className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                WhatsApp
              </span>
              <span className="font-display text-[17px] font-bold text-[var(--navy)]">
                {PHONE_DISPLAY}
              </span>
            </span>
          </a>
        </div>

        <div
          className="anim-fade-up mt-10"
          style={{ animationDelay: "420ms" }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--navy)]/15 bg-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--navy)] shadow-[0_10px_24px_rgba(11,45,90,0.08)] transition-all hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/40 hover:bg-[var(--brand-ice)]"
          >
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
              <path d="M19 12H5" />
              <path d="M11 18l-6-6 6-6" />
            </svg>
            {t("common.backHome")}
          </Link>
        </div>
      </div>
    </section>
  );
}
