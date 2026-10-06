"use client";

import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/Reveal";
import type { Lang } from "@/lib/i18n";

function formatPastCongressFullTitle(
  number: number,
  seriesName: string,
  lang: Lang,
): string {
  if (lang === "en") {
    const suffix =
      number === 1
        ? "st"
        : number === 2
          ? "nd"
          : number === 3
            ? "rd"
            : "th";
    return `${number}${suffix} ${seriesName}`;
  }
  return `${number}. ${seriesName}`;
}

const EDITIONS = [
  {
    editionKey: "past.editionLabel.sixth",
    number: 6,
    image: "/img/congress_6.png",
    pdf: "/pdf/6.SosyalSaglikBilimleri-BildirKitabi.pdf",
  },
  {
    editionKey: "past.editionLabel.fifth",
    number: 5,
    image: "/img/congress_5.png",
    pdf: "/pdf/5.SosyalSaglikBilimleri-BildirKitabi.pdf",
  },
  {
    editionKey: "past.editionLabel.fourth",
    number: 4,
    image: "/img/congress_4.png",
    pdf: "/pdf/4.SosyalSaglikBilimleri-BildirKitabi.pdf",
  },
  {
    editionKey: "past.editionLabel.third",
    number: 3,
    image: "/img/congress_3.png",
    pdf: "/pdf/3.SosyalSaglikBilimleri-BildiriKitabi.pdf",
  },
  {
    editionKey: "past.editionLabel.second",
    number: 2,
    image: "/img/congress_2.png",
    pdf: "/pdf/2.SosyalSaglikBilimler-BildiriKitabi.pdf",
  },
  {
    editionKey: "past.editionLabel.first",
    number: 1,
    image: "/img/congress_1.png",
    pdf: "/pdf/1.SosyalSaglikBilimler-BildiriKitabi.pdf",
  },
];

export function PastCongresses() {
  const { t, lang } = useLang();
  return (
    <section
      id="past-congresses"
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
              {t("past.eyebrow")}
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
          <h2 className="mt-5 font-display text-[clamp(28px,4.2vw,44px)] font-bold leading-tight text-[var(--navy)]">
            {t("past.title")}
          </h2>
        </Reveal>

        <Reveal delayMs={200}>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--gray)]">
            {t("past.subtitle")}
          </p>
        </Reveal>

        <Reveal delayMs={280}>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {EDITIONS.map((ed) => (
              <a
                key={ed.number}
                href={ed.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white shadow-[0_12px_30px_rgba(11,45,90,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(11,45,90,0.1)]"
              >
                {/* Image Aspect ratio container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--brand-ice)]/30">
                  <img
                    src={ed.image}
                    alt={t(ed.editionKey)}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)]/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  {/* Glassmorphic Badge */}
                  <span className="absolute right-4 top-4 rounded-full bg-white/85 backdrop-blur-[4px] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--navy)] ring-1 ring-white/20 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                    {t("past.statusPast")}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                    {t(ed.editionKey)}
                  </span>
                  <h3 className="mt-2 font-display text-[15px] font-bold leading-snug text-[var(--navy)] transition-colors group-hover:text-[var(--brand-blue)]">
                    {formatPastCongressFullTitle(
                      ed.number,
                      t("past.seriesName"),
                      lang,
                    )}
                  </h3>
                  
                  {/* Action Link Indicator */}
                  <div className="mt-6 pt-5 border-t border-[var(--border-soft)] flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[var(--brand-blue)] group-hover:text-[var(--gold)] transition-colors">
                    <span>{t("past.readBook")}</span>
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
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
