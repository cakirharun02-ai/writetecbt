"use client";

import { useLang } from "@/components/LanguageProvider";

const NS = "publications.kitap";

type Props = {
  className?: string;
};

export function AkademisyenYayineviCard({ className }: Props) {
  const { t } = useLang();

  return (
    <a
      href="https://akademisyen.com/"
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex max-w-3xl items-center gap-5 rounded-2xl border border-[var(--border-soft)] border-l-4 border-l-[var(--gold)] bg-white p-7 shadow-[0_12px_32px_rgba(11,45,90,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/35 hover:shadow-[0_18px_40px_rgba(11,45,90,0.12)] sm:gap-6 sm:p-8 ${className ?? ""}`}
    >
      <span
        className="flex h-14 w-14 flex-shrink-0 items-center justify-center self-center rounded-xl bg-[var(--brand-ice)] text-[var(--navy)] sm:h-16 sm:w-16"
        aria-hidden="true"
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20V4H6.5A2.5 2.5 0 004 6.5v13z" />
          <path d="M8 7h8M8 11h6" />
        </svg>
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[18px] leading-[1.85] text-[var(--navy)] sm:text-[20px]">
          <span className="font-semibold">{t(`${NS}.bodyNoteIndex`)}</span> {t(`${NS}.bodyNoteMid`)}
        </p>

        <p className="mt-3 text-[18px] leading-[1.85] font-semibold text-[var(--navy)] sm:text-[20px]">
          {t(`${NS}.bodyNotePublisher`)}
        </p>

        <p className="mt-3 text-[18px] leading-[1.85] text-[var(--brand-blue)] sm:text-[20px]">
          ({t(`${NS}.bodyNoteUrl`)})
        </p>

        <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] px-6 py-3 text-[13px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_10px_24px_rgba(11,45,90,0.18)] transition-all group-hover:shadow-[0_14px_28px_rgba(11,45,90,0.26)]">
          {t(`${NS}.bodyNoteCta`)}
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
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </span>
      </div>
    </a>
  );
}
