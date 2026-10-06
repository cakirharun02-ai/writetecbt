"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

export function Hero() {
  const { t } = useLang();
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[var(--navy)] via-[var(--navy-2)] to-[var(--brand-blue)] text-white">
      <div
        className="anim-drift pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(900px 320px at 12% 18%, rgba(77,168,229,0.32) 0%, rgba(77,168,229,0) 55%), radial-gradient(800px 280px at 88% 28%, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0) 62%), radial-gradient(700px 280px at 68% 110%, rgba(77,168,229,0.22) 0%, rgba(77,168,229,0) 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-[340px] w-[340px] rounded-full border border-[var(--brand-sky)]/15"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-16 h-[420px] w-[420px] rounded-full border border-[var(--gold)]/15"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pb-24 pt-20 text-center sm:px-8 sm:pt-28 md:pb-32 md:pt-32">
        <span
          className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-white/90 shadow-[0_12px_26px_rgba(0,0,0,0.18)] backdrop-blur"
          style={{ animationDelay: "80ms" }}
        >
          <span className="anim-pulse-ring inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
          {t("hero.eyebrow")}
        </span>

        <h1
          className="anim-fade-up mt-7 font-display text-[clamp(34px,6vw,64px)] font-bold leading-[1.1] tracking-tight"
          style={{ animationDelay: "180ms" }}
        >
          {t("hero.titleLead")}{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] bg-clip-text text-transparent">
              {t("hero.titleAccent")}
            </span>
            <span
              className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-[var(--gold)] to-transparent"
              aria-hidden="true"
            />
          </span>{" "}
          {t("hero.titleTrail")}
        </h1>

        <p
          className="anim-fade-up mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-[17px]"
          style={{ animationDelay: "280ms" }}
        >
          {t("hero.subtitle")}
        </p>

        <div
          className="anim-fade-up mt-9 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "380ms" }}
        >
          <Link
            href="#active-congresses"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-white to-white/95 px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--navy)] shadow-[0_18px_36px_rgba(0,0,0,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(0,0,0,0.34)]"
          >
            <span className="relative z-10">{t("hero.cta")}</span>
            <svg
              className="relative z-10 transition-transform group-hover:translate-x-0.5"
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
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[var(--gold)]/60 hover:bg-white/10"
          >
            {t("hero.ctaSecondary")}
          </Link>
        </div>

        <div
          className="anim-divider-wipe mt-16 h-px w-full max-w-3xl"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.9) 35%, rgba(77,168,229,0.55) 70%, transparent 100%)",
            animationDelay: "560ms",
          }}
        />
      </div>
    </section>
  );
}
