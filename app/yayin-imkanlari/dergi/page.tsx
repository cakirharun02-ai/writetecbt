"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/Reveal";

type JournalItem = {
  name: string;
  url: string;
  domain: string;
};

const TR_JOURNALS: JournalItem[] = [
  {
    name: "İnsan ve Toplum Bilimleri Araştırmaları Dergisi (itobiad)",
    url: "https://dergipark.org.tr/tr/pub/itobiad",
    domain: "dergipark.org.tr",
  },
];

const OTHER_JOURNALS: JournalItem[] = [
  {
    name: "Marmara Sosyal Araştırmalar Dergisi",
    url: "https://dergipark.org.tr/tr/pub/marusad",
    domain: "dergipark.org.tr",
  },
  {
    name: "Uygulamalı Sosyal Bilimler ve Güzel Sanatlar Dergisi (SOSGÜZ)",
    url: "https://dergipark.org.tr/tr/pub/sosguz",
    domain: "dergipark.org.tr",
  },
  {
    name: "Süleyman Demirel Üniversitesi İnsan Kaynakları Yönetimi Dergisi (SDUIKYD)",
    url: "https://dergipark.org.tr/tr/pub/sduikyd",
    domain: "dergipark.org.tr",
  },
  {
    name: "Econder Uluslararası Akademik Dergisi",
    url: "https://dergipark.org.tr/tr/pub/econder",
    domain: "dergipark.org.tr",
  },
  {
    name: "Studies On Social Science Insights (SOSSCI)",
    url: "https://www.sossci.org/SonSayi.Aspx",
    domain: "sossci.org",
  },
];

export default function Page() {
  const { t } = useLang();

  return (
    <section className="relative isolate overflow-hidden bg-[var(--cream)] min-h-screen">
      {/* Decorative background spots */}
      <div
        className="pointer-events-none absolute -left-32 top-12 h-96 w-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(77,168,229,0.14) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/3 h-96 w-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/4 bottom-12 h-96 w-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(77,168,229,0.08) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="anim-fade-up flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--gray)]"
        >
          <Link href="/" className="hover:text-[var(--navy)] transition-colors">
            {t("common.breadcrumbHome")}
          </Link>
          <span className="text-[var(--gold)]">›</span>
          <Link
            href="/yayin-imkanlari"
            className="hover:text-[var(--navy)] transition-colors"
          >
            {t("common.breadcrumbPublications")}
          </Link>
          <span className="text-[var(--gold)]">›</span>
          <span className="text-[var(--navy)] font-bold">
            {t("publications.dergi.title")}
          </span>
        </nav>

        {/* Hero Header */}
        <div className="mt-8 max-w-4xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--gold)]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
              {t("publications.dergi.subtitle")}
            </span>
          </Reveal>

          <Reveal delayMs={80}>
            <h1 className="mt-4 font-display text-[clamp(28px,4.6vw,46px)] font-bold leading-tight text-[var(--navy)]">
              {t("publications.dergi.title")}
            </h1>
          </Reveal>

          <Reveal delayMs={160}>
            <p className="mt-6 text-[16px] sm:text-[18px] leading-relaxed text-[var(--navy-2)] font-medium max-w-4xl border-l-2 border-[var(--gold)] pl-5">
              {t("publications.dergi.intro")}
            </p>
          </Reveal>
        </div>

        {/* Categories Section */}
        <div className="mt-16 space-y-16">
          
          {/* 1. SCOPUS Category */}
          <Reveal delayMs={240}>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_0_4px_rgba(201,168,76,0.25)]" />
                <h2 className="font-display text-[22px] sm:text-[26px] font-bold text-[var(--navy)]">
                  {t("publications.dergi.scopusTitle")}
                </h2>
                <span className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
              </div>

              {/* SCOPUS Paid Info Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-[var(--gold)]/20 bg-white/70 p-6 sm:p-8 shadow-[0_12px_36px_rgba(11,45,90,0.04)] backdrop-blur transition-all duration-300 hover:shadow-[0_16px_48px_rgba(11,45,90,0.08)]">
                <span
                  className="pointer-events-none absolute left-0 top-0 h-full w-[5px]"
                  style={{
                    background:
                      "linear-gradient(180deg, var(--gold) 0%, rgba(201,168,76,0.3) 100%)",
                  }}
                  aria-hidden="true"
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded bg-[var(--gold)]/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--gold)]">
                      {t("publications.dergi.scopusTitle")}
                    </div>
                    <p className="text-[15px] sm:text-[16px] font-semibold text-[var(--gray)]">
                      {t("publications.dergi.scopusDesc")}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Link
                      href="/iletisim"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_20px_rgba(11,45,90,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(11,45,90,0.26)]"
                    >
                      {t("nav.contact")}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 2. TR Dizin Category */}
          <Reveal delayMs={300}>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-blue)] shadow-[0_0_0_4px_rgba(47,103,184,0.25)]" />
                <h2 className="font-display text-[22px] sm:text-[26px] font-bold text-[var(--navy)]">
                  {t("publications.dergi.trIndexTitle")}
                </h2>
                <span className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
              </div>

              {/* TR Dizin Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TR_JOURNALS.map((journal, idx) => (
                  <JournalCard
                    key={idx}
                    journal={journal}
                    accentColor="var(--brand-blue)"
                    visitLabel={t("publications.dergi.visitJournal")}
                  />
                ))}
              </div>
            </div>
          </Reveal>

          {/* 3. Other Journals Category */}
          <Reveal delayMs={360}>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-sky)] shadow-[0_0_0_4px_rgba(77,168,229,0.25)]" />
                <h2 className="font-display text-[22px] sm:text-[26px] font-bold text-[var(--navy)]">
                  {t("publications.dergi.otherTitle")}
                </h2>
                <span className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
              </div>

              {/* Other Journals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {OTHER_JOURNALS.map((journal, idx) => (
                  <JournalCard
                    key={idx}
                    journal={journal}
                    accentColor="var(--brand-sky)"
                    visitLabel={t("publications.dergi.visitJournal")}
                  />
                ))}
              </div>
            </div>
          </Reveal>

        </div>

        {/* Footer Navigation Buttons */}
        <Reveal delayMs={420}>
          <div className="mt-16 flex flex-wrap gap-4 border-t border-[var(--border)] pt-10">
            <Link
              href="/yayin-imkanlari"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--navy)]/15 bg-white px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--navy)] shadow-[0_8px_20px_rgba(11,45,90,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/30 hover:bg-[var(--brand-ice)] hover:shadow-[0_12px_28px_rgba(11,45,90,0.1)]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              {t("common.backPublications")}
            </Link>
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_24px_rgba(11,45,90,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(11,45,90,0.28)]"
            >
              {t("nav.contact")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

interface JournalCardProps {
  journal: JournalItem;
  accentColor: string;
  visitLabel: string;
}

function JournalCard({ journal, accentColor, visitLabel }: JournalCardProps) {
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[0_10px_30px_rgba(11,45,90,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_18px_48px_rgba(11,45,90,0.09)]">
      {/* Visual Accent Bar */}
      <span
        className="pointer-events-none absolute left-0 top-0 h-full w-[4px]"
        style={{
          background: `linear-gradient(180deg, ${accentColor} 0%, rgba(11,45,90,0.1) 100%)`,
        }}
        aria-hidden="true"
      />

      <div className="space-y-4">
        {/* Domain Badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded bg-[var(--cream)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--gray)] border border-[var(--border)]/40">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {journal.domain}
          </span>
          <span className="text-[var(--border)] group-hover:text-[var(--brand-blue)]/50 transition-colors">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </span>
        </div>

        {/* Journal Name */}
        <h3 className="font-sans text-[15.5px] font-bold leading-snug text-[var(--navy)] group-hover:text-[var(--brand-blue)] transition-colors duration-200">
          {journal.name}
        </h3>
      </div>

      {/* Button link */}
      <div className="mt-6 pt-4 border-t border-[var(--cream)]">
        <a
          href={journal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--navy)] group-hover:text-[var(--brand-blue)] transition-colors"
        >
          {visitLabel}
          <svg
            className="transition-transform duration-300 group-hover:translate-x-0.5"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </article>
  );
}
