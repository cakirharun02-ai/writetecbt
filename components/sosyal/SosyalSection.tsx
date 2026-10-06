"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { SOSYAL_HOME } from "@/components/sosyal/nav";

export function SosyalSection({
  eyebrow,
  title,
  subtitle,
  children,
  maxWidth = "max-w-4xl",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  const { t } = useLang();

  return (
    <section className="relative isolate overflow-hidden bg-[var(--cream)]">
      <div
        className="pointer-events-none absolute -left-32 top-12 h-72 w-72 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(77,168,229,0.16) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-12 h-80 w-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className={`relative mx-auto ${maxWidth} px-5 py-16 sm:px-8 sm:py-20`}>
        <nav
          aria-label="Breadcrumb"
          className="anim-fade-up flex flex-wrap items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--gray)]"
        >
          <Link href="/" className="hover:text-[var(--navy)]">
            WRITETEC
          </Link>
          <span className="text-[var(--gold)]">›</span>
          <Link href={SOSYAL_HOME} className="hover:text-[var(--navy)]">
            {t("pages.sosyal.breadcrumb.series")}
          </Link>
          <span className="text-[var(--gold)]">›</span>
          <span className="text-[var(--navy)]">{title}</span>
        </nav>

        {eyebrow && (
          <p
            className="anim-fade-up mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--gold)]"
            style={{ animationDelay: "80ms" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            {eyebrow}
          </p>
        )}

        <h1
          className="anim-fade-up mt-4 font-display text-[clamp(28px,4.6vw,46px)] font-bold leading-tight text-[var(--navy)]"
          style={{ animationDelay: "160ms" }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="anim-fade-up mt-3 max-w-2xl text-[15px] font-semibold text-[var(--brand-blue)]"
            style={{ animationDelay: "220ms" }}
          >
            {subtitle}
          </p>
        )}

        <div className="anim-fade-up mt-8" style={{ animationDelay: "280ms" }}>
          {children}
        </div>
      </div>
    </section>
  );
}

export function SosyalProse({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 text-[15.5px] leading-relaxed text-[var(--gray)] [&_a]:font-semibold [&_a]:text-[var(--brand-blue)] [&_a:hover]:underline [&_strong]:text-[var(--navy)] [&_b]:text-[var(--navy)]">
      {children}
    </div>
  );
}
