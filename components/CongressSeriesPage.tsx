"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

export type Edition = {
  number: number;
  editionKey: string;
  status: "past" | "active" | "upcoming";
  href?: string;
  image?: string;
  pdf?: string;
  /** Optional abstract (özet) book; when set the card shows both books as separate links. */
  abstractPdf?: string;
};

type Props = {
  seriesNs: "series.sosyalSaglik" | "series.muhendislik";
  seriesNameKey: string;
  editions: Edition[];
  showComingSoon?: boolean;
  /** Hide active/upcoming sections; show past congresses only (with empty state). */
  pastOnly?: boolean;
};

export function CongressSeriesPage({
  seriesNs,
  seriesNameKey,
  editions,
  showComingSoon = false,
  pastOnly = false,
}: Props) {
  const { t } = useLang();

  const past = editions.filter((e) => e.status === "past");
  const active = editions.filter((e) => e.status === "active");
  const upcoming = editions.filter((e) => e.status === "upcoming");

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
        <nav
          aria-label="Breadcrumb"
          className="anim-fade-up flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--gray)]"
        >
          <Link href="/" className="hover:text-[var(--navy)]">
            {t("common.breadcrumbHome")}
          </Link>
          <span className="text-[var(--gold)]">›</span>
          <Link href="/kongrelerimiz" className="hover:text-[var(--navy)]">
            {t("common.breadcrumbCongresses")}
          </Link>
          <span className="text-[var(--gold)]">›</span>
          <span className="text-[var(--navy)]">{t(`${seriesNs}.title`)}</span>
        </nav>

        <p
          className="anim-fade-up mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--gold)]"
          style={{ animationDelay: "80ms" }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
          {t("pages.kongrelerimiz.eyebrow")}
        </p>

        <h1
          className="anim-fade-up mt-4 font-display text-[clamp(32px,5vw,52px)] font-bold leading-tight text-[var(--navy)]"
          style={{ animationDelay: "160ms" }}
        >
          {t(`${seriesNs}.title`)}
        </h1>
        <p
          className="anim-fade-up mt-3 max-w-2xl text-[15px] font-semibold text-[var(--brand-blue)]"
          style={{ animationDelay: "220ms" }}
        >
          {t(`${seriesNs}.subtitle`)}
        </p>
        <p
          className="anim-fade-up mt-4 max-w-3xl text-[15.5px] leading-relaxed text-[var(--gray)]"
          style={{ animationDelay: "280ms" }}
        >
          {t(`${seriesNs}.description`)}
        </p>

        {showComingSoon && (
          <div
            className="anim-fade-up mt-12 rounded-2xl border border-dashed border-[var(--gold)]/50 bg-white p-10 text-center"
            style={{ animationDelay: "360ms" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)]/15 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.24em] text-[var(--gold)]">
              <span className="anim-pulse-ring inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
              {t("common.comingSoon")}
            </span>
            <p className="mt-4 font-display text-[20px] font-bold text-[var(--navy)]">
              {t(`${seriesNs}.comingSoon`)}
            </p>
          </div>
        )}

        {!pastOnly && active.length > 0 && (
          <div className="anim-fade-up mt-12" style={{ animationDelay: "360ms" }}>
            <h2 className="font-display text-[20px] font-bold text-[var(--navy)]">
              {t(`${seriesNs}.activeTitle`)}
            </h2>
            <div className="mt-4 space-y-3">
              {active.map((ed) => (
                <EditionRow
                  key={ed.number}
                  edition={ed}
                  seriesNameKey={seriesNameKey}
                />
              ))}
            </div>
          </div>
        )}

        {(pastOnly || past.length > 0) && (
          <div className="anim-fade-up mt-12" style={{ animationDelay: "440ms" }}>
            <h2 className="font-display text-[20px] font-bold text-[var(--navy)]">
              {t(`${seriesNs}.pastTitle`)}
            </h2>
            {past.length > 0 ? (
              past[0].image ? (
                <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map((ed) => (
                    <EditionCard
                      key={ed.number}
                      edition={ed}
                      seriesNameKey={seriesNameKey}
                    />
                  ))}
                </div>
              ) : (
                <ol className="mt-4 divide-y divide-[var(--border-soft)] overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white shadow-[0_14px_32px_rgba(11,45,90,0.05)]">
                  {past.map((ed) => (
                    <EditionRow
                      key={ed.number}
                      edition={ed}
                      seriesNameKey={seriesNameKey}
                    />
                  ))}
                </ol>
              )
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-[var(--border-soft)] bg-white px-5 py-4 text-[14px] italic text-[var(--gray)]">
                {t(`${seriesNs}.emptyPast`)}
              </p>
            )}
          </div>
        )}

        {!pastOnly && upcoming.length === 0 && !showComingSoon && (
          <div className="anim-fade-up mt-12" style={{ animationDelay: "520ms" }}>
            <h2 className="font-display text-[20px] font-bold text-[var(--navy)]">
              {t(`${seriesNs}.upcomingTitle`)}
            </h2>
            <p className="mt-3 rounded-xl border border-dashed border-[var(--border-soft)] bg-white px-5 py-4 text-[14px] italic text-[var(--gray)]">
              {t(`${seriesNs}.emptyUpcoming`)}
            </p>
          </div>
        )}

        <div
          className="anim-fade-up mt-12"
          style={{ animationDelay: "600ms" }}
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

function EditionRow({
  edition,
  seriesNameKey,
}: {
  edition: Edition;
  seriesNameKey: string;
}) {
  const { t } = useLang();
  const isActive = edition.status === "active";
  return (
    <li
      className={[
        "flex items-start gap-5 px-5 py-5 transition-colors sm:gap-6 sm:px-7",
        isActive
          ? "bg-gradient-to-br from-[var(--brand-ice)] to-white"
          : "hover:bg-[var(--brand-ice)]/40",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-display text-[18px] font-bold ring-1",
          isActive
            ? "bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] text-white ring-transparent shadow-[0_10px_22px_rgba(11,45,90,0.25)]"
            : "bg-white text-[var(--brand-blue)] ring-[var(--border-soft)]",
        ].join(" ")}
      >
        {edition.number}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={[
            "text-[10.5px] font-bold uppercase tracking-[0.24em]",
            isActive ? "text-[var(--brand-blue)]" : "text-[var(--gold)]",
          ].join(" ")}
        >
          {t(edition.editionKey)}
          {isActive && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[var(--gold)]/15 px-2 py-0.5 text-[9.5px] font-bold tracking-[0.16em] text-[var(--gold)]">
              <span className="anim-pulse-ring inline-block h-1 w-1 rounded-full bg-[var(--gold)]" />
              {t("active.badge")}
            </span>
          )}
        </p>
        <h3 className="mt-1 font-display text-[16.5px] font-bold leading-snug text-[var(--navy)]">
          {t(seriesNameKey)}
        </h3>
      </div>
      <span className="hidden flex-shrink-0 self-center rounded-full border border-[var(--border-soft)] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--gray)] sm:inline-flex">
        {isActive ? t("active.badge") : t("past.statusPast")}
      </span>
    </li>
  );
}

function EditionCard({
  edition,
  seriesNameKey,
}: {
  edition: Edition;
  seriesNameKey: string;
}) {
  const { t, lang } = useLang();
  const formatFullTitle = (num: number, name: string) => {
    if (lang === "en") {
      const suffix =
        num === 1
          ? "st"
          : num === 2
            ? "nd"
            : num === 3
              ? "rd"
              : "th";
      return `${num}${suffix} ${name}`;
    }
    return `${num}. ${name}`;
  };

  const cardClass =
    "group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white shadow-[0_12px_30px_rgba(11,45,90,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(11,45,90,0.1)]";

  const media = (
    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--brand-ice)]/30">
      {edition.image && (
        <img
          src={edition.image}
          alt={t(edition.editionKey)}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)]/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Glassmorphic Badge */}
      <span className="absolute right-4 top-4 rounded-full bg-white/85 backdrop-blur-[4px] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--navy)] ring-1 ring-white/20 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        {t("past.statusPast")}
      </span>
    </div>
  );

  const heading = (
    <>
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
        {t(edition.editionKey)}
      </span>
      <h3 className="mt-2 font-display text-[15px] font-bold leading-snug text-[var(--navy)] transition-colors group-hover:text-[var(--brand-blue)]">
        {formatFullTitle(edition.number, t(seriesNameKey))}
      </h3>
    </>
  );

  // Two-book variant: full-text proceedings + abstract book as separate links.
  if (edition.abstractPdf) {
    return (
      <div className={cardClass}>
        {media}
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          {heading}
          <div className="mt-6 flex flex-col gap-2.5 border-t border-[var(--border-soft)] pt-5">
            {edition.pdf && (
              <BookLink href={edition.pdf} label={t("past.fullTextBook")} />
            )}
            <BookLink href={edition.abstractPdf} label={t("past.abstractBook")} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={edition.pdf || edition.href || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClass}
    >
      {media}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {heading}

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
  );
}

function BookLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--brand-ice)]/30 px-3.5 py-2.5 text-[10.5px] font-bold uppercase tracking-wider text-[var(--brand-blue)] transition-all hover:border-[var(--brand-blue)]/40 hover:bg-[var(--brand-ice)] hover:text-[var(--gold)]"
    >
      <span className="leading-tight">{label}</span>
      <svg
        className="h-4 w-4 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
        />
      </svg>
    </a>
  );
}
