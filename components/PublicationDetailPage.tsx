"use client";

import Link from "next/link";
import { EditorluKitapGrid } from "@/components/EditorluKitapGrid";
import { useLang } from "@/components/LanguageProvider";

type Props = {
  ns: "publications.dergi" | "publications.kitap" | "publications.bildiri";
};

export function PublicationDetailPage({ ns }: Props) {
  const { t } = useLang();
  const isKitap = ns === "publications.kitap";
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
      <div
        className={`relative mx-auto px-5 py-20 sm:px-8 sm:py-24 ${isKitap ? "max-w-6xl" : "max-w-4xl"}`}
      >
        <nav
          aria-label="Breadcrumb"
          className="anim-fade-up flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--gray)]"
        >
          <Link href="/" className="hover:text-[var(--navy)]">
            {t("common.breadcrumbHome")}
          </Link>
          <span className="text-[var(--gold)]">›</span>
          <Link href="/yayin-imkanlari" className="hover:text-[var(--navy)]">
            {t("common.breadcrumbPublications")}
          </Link>
        </nav>

        {!isKitap ? (
          <p
            className="anim-fade-up mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--gold)]"
            style={{ animationDelay: "80ms" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            {t("common.comingSoon")}
          </p>
        ) : null}

        <h1
          className="anim-fade-up mt-4 font-display text-[clamp(28px,4.6vw,44px)] font-bold leading-tight text-[var(--navy)]"
          style={{ animationDelay: "160ms" }}
        >
          {t(`${ns}.title`)}
        </h1>
        <p
          className="anim-fade-up mt-3 text-[15px] font-semibold text-[var(--brand-blue)]"
          style={{ animationDelay: "220ms" }}
        >
          {t(`${ns}.subtitle`)}
        </p>
        <p
          className="anim-fade-up mt-5 max-w-2xl text-[16px] leading-relaxed text-[var(--gray)]"
          style={{ animationDelay: "280ms" }}
        >
          {t(`${ns}.body`)}
        </p>

        {isKitap ? (
          <div className="anim-fade-up" style={{ animationDelay: "340ms" }}>
            <EditorluKitapGrid />
          </div>
        ) : null}

        <div
          className="anim-fade-up mt-10 flex flex-wrap gap-3"
          style={{ animationDelay: "380ms" }}
        >
          {isKitap ? (
            <a
              href="/yayin-imkanlari/kitap/form"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light,#e8c97a)] px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--navy)] shadow-[0_12px_28px_rgba(201,168,76,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(201,168,76,0.4)]"
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
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20V4H6.5A2.5 2.5 0 004 6.5v13z" />
                <path d="M12 8v6M9 11h6" />
              </svg>
              {t("publications.kitap.submitChapter")}
            </a>
          ) : null}
          <Link
            href="/yayin-imkanlari"
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
            {t("common.backPublications")}
          </Link>
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_12px_28px_rgba(11,45,90,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(11,45,90,0.3)]"
          >
            {t("nav.contact")}
          </Link>
        </div>
      </div>
    </section>
  );
}
