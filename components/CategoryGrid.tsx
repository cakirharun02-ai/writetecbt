"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

export type CategoryItem = {
  titleKey: string;
  descKey: string;
  href: string;
};

type Props = {
  eyebrowKey: string;
  titleKey: string;
  leadKey: string;
  items: CategoryItem[];
  badgeKey?: string;
};

export function CategoryGrid({
  eyebrowKey,
  titleKey,
  leadKey,
  items,
  badgeKey,
}: Props) {
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
      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <p className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--gold)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
          {t(eyebrowKey)}
        </p>
        <h1
          className="anim-fade-up mt-5 font-display text-[clamp(32px,5vw,52px)] font-bold leading-tight text-[var(--navy)]"
          style={{ animationDelay: "120ms" }}
        >
          {t(titleKey)}
        </h1>
        <p
          className="anim-fade-up mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--gray)]"
          style={{ animationDelay: "220ms" }}
        >
          {t(leadKey)}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="anim-fade-up group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white p-7 shadow-[0_14px_36px_rgba(11,45,90,0.06)] transition-all hover:-translate-y-1 hover:border-[var(--brand-blue)]/40 hover:shadow-[0_22px_48px_rgba(11,45,90,0.14)]"
              style={{ animationDelay: `${320 + i * 100}ms` }}
            >
              <span
                className="pointer-events-none absolute left-0 top-0 h-full w-1 transition-all group-hover:w-1.5"
                style={{
                  background:
                    "linear-gradient(180deg, var(--gold) 0%, rgba(201,168,76,0.4) 100%)",
                }}
                aria-hidden="true"
              />
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(11,45,90,0.22)]">
                <span className="font-display text-[15px] font-bold">
                  {i + 1}
                </span>
              </span>
              <h2 className="font-display text-[19px] font-bold leading-tight text-[var(--navy)] group-hover:text-[var(--brand-blue)]">
                {t(item.titleKey)}
              </h2>
              <p className="text-[14px] leading-relaxed text-[var(--gray)]">
                {t(item.descKey)}
              </p>
              <div className="mt-auto flex items-center gap-2 pt-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                <span>{badgeKey ? t(badgeKey) : t("common.learnMore")}</span>
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
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
