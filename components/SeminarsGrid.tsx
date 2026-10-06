"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/Reveal";
import { SEMINARS } from "@/lib/seminars";

export function SeminarsGrid() {
  const { t, lang } = useLang();
  return (
    <section
      id="seminars"
      className="relative isolate overflow-hidden bg-white py-20 sm:py-28"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(11,45,90,0.12) 50%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 top-24 h-80 w-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(77,168,229,0.10) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="flex items-center gap-4">
            <span
              className="h-[2px] w-7 rounded"
              style={{
                background:
                  "linear-gradient(90deg, var(--gold) 0%, transparent 100%)",
              }}
            />
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_0_4px_rgba(201,168,76,0.2)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
              {t("seminars.eyebrow")}
            </span>
            <span
              className="h-px flex-1"
              style={{
                background:
                  "linear-gradient(90deg, rgba(77,168,229,0.55) 0%, rgba(11,45,90,0.16) 55%, rgba(11,45,90,0.05) 100%)",
              }}
            />
          </div>
        </Reveal>

        <Reveal delayMs={120}>
          <h1 className="mt-5 font-display text-[clamp(28px,4.2vw,44px)] font-bold leading-tight text-[var(--navy)]">
            {t("seminars.title")}
          </h1>
        </Reveal>

        <Reveal delayMs={200}>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--gray)]">
            {t("seminars.subtitle")}
          </p>
        </Reveal>

        <div
          className="anim-fade-up mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          style={{ animationDelay: "280ms" }}
        >
            {SEMINARS.map((s) => (
              <Link
                key={s.slug}
                href={`/seminerler/${s.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white shadow-[0_12px_30px_rgba(11,45,90,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(11,45,90,0.1)]"
              >
                {/* Image / blank placeholder */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--brand-ice)]/30">
                  {s.image ? (
                    <>
                      <img
                        src={s.image}
                        alt={s.title[lang]}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)]/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </>
                  ) : (
                    <div
                      className="flex h-full w-full flex-col items-center justify-center gap-3"
                      style={{
                        background:
                          "linear-gradient(150deg, var(--brand-ice) 0%, #ffffff 55%, rgba(201,168,76,0.10) 100%)",
                      }}
                    >
                      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(11,45,90,0.22)]">
                        <span className="font-display text-[20px] font-bold">
                          {s.order}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--gray)]">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {t("seminars.imageSoon")}
                      </span>
                    </div>
                  )}

                  {/* Glassmorphic Badge */}
                  <span className="absolute right-4 top-4 rounded-full bg-white/85 backdrop-blur-[4px] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--navy)] ring-1 ring-white/20 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                    {t("seminars.badge")}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                    {s.category[lang]}
                  </span>
                  <h2 className="mt-2 font-display text-[15px] font-bold leading-snug text-[var(--navy)] transition-colors group-hover:text-[var(--brand-blue)]">
                    {s.title[lang]}
                  </h2>

                  <div className="mt-auto flex w-full flex-col items-start pt-4">
                    {s.date ? (
                      <span className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand-blue)]">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        {s.date[lang]}
                      </span>
                    ) : null}

                    {s.time ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand-blue)]">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {s.time[lang]}
                      </span>
                    ) : null}

                    {s.location ? (
                      <span className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand-blue)]">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M2 12h20" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        {s.location[lang]}
                      </span>
                    ) : null}

                    {/* Action Link Indicator */}
                    <div className="mt-6 flex w-full items-center gap-2 border-t border-[var(--border-soft)] pt-5 text-[11px] font-bold uppercase tracking-wider text-[var(--brand-blue)] transition-colors group-hover:text-[var(--gold)]">
                      <span>{t("seminars.cardCta")}</span>
                      <svg
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
