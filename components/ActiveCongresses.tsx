"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/Reveal";

type ActiveCongress = {
  ns: "active" | "active2";
  edition: number;
  image: string;
  href: string;
};

const CONGRESSES: ActiveCongress[] = [
  {
    ns: "active2",
    edition: 7,
    image: "/7.kongre.png",
    href: "/kongrelerimiz/sosyal-saglik-bilimleri/guncel",
  },
];

export function ActiveCongresses() {
  const { t } = useLang();
  return (
    <section
      id="active-congresses"
      className="relative isolate overflow-hidden bg-[var(--cream)] py-20 sm:py-28"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.5) 50%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full"
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
            "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
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
              {t("active.eyebrow")}
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
            {t("active.title")}
          </h2>
        </Reveal>

        <Reveal delayMs={200}>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--gray)]">
            {t("active.subtitle")}
          </p>
        </Reveal>

        <div className="space-y-8">
          {CONGRESSES.map((c, i) => (
            <Reveal key={c.ns} delayMs={260 + i * 80}>
              <ActiveCongressFeature congress={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ActiveCongressFeature({ congress }: { congress: ActiveCongress }) {
  const { t } = useLang();
  const ns = congress.ns;
  return (
    <article className="group relative mt-10 grid grid-cols-1 overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-white shadow-[0_22px_56px_rgba(11,45,90,0.10)] transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_64px_rgba(11,45,90,0.16)] md:grid-cols-[1.05fr_1fr]">
      <span
        className="pointer-events-none absolute left-0 top-0 z-10 h-full w-[6px]"
        style={{
          background:
            "linear-gradient(180deg, var(--gold) 0%, rgba(201,168,76,0.4) 100%)",
        }}
        aria-hidden="true"
      />
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--navy)] md:aspect-auto md:min-h-[360px]">
        <Image
          src={congress.image}
          alt={t(`${ns}.congressTitle`)}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover opacity-95 transition-transform duration-700 group-hover:scale-[1.03]"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
        <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/55 bg-black/40 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.24em] text-[var(--gold-light)] backdrop-blur">
          <span className="anim-pulse-ring inline-block h-2 w-2 rounded-full bg-[var(--gold)]" />
          {t(`${ns}.badge`)}
        </span>
      </div>

      <div className="flex flex-col gap-5 p-7 sm:p-9">
        <span className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
          {congress.edition}. {t("past.edition")}
        </span>
        <h3 className="font-display lining-nums text-[clamp(22px,2.4vw,28px)] font-bold leading-tight text-[var(--navy)]">
          {t(`${ns}.congressTitle`)}
        </h3>
        <p className="text-[14.5px] leading-relaxed text-[var(--gray)]">
          {t(`${ns}.congressTagline`)}
        </p>

        <dl className="grid grid-cols-2 gap-4 border-t border-[var(--border-soft)] pt-5">
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-ice)] text-[var(--brand-blue)]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
              </svg>
            </span>
            <div className="min-w-0">
              <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                {t(`${ns}.dateLabel`)}
              </dt>
              <dd className="mt-0.5 text-[14px] font-semibold text-[var(--navy)]">
                {t(`${ns}.dateValue`)}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-ice)] text-[var(--brand-blue)]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <div className="min-w-0">
              <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                {t(`${ns}.locationLabel`)}
              </dt>
              <dd className="mt-0.5 text-[14px] font-semibold text-[var(--navy)]">
                {t(`${ns}.locationValue`)}
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap gap-3 pt-2">
          <Link
            href={congress.href}
            className="group/cta inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] px-6 py-3 text-[12.5px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(11,45,90,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(11,45,90,0.32)]"
          >
            {t(`${ns}.cta`)}
            <svg
              className="transition-transform group-hover/cta:translate-x-0.5"
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
          </Link>
        </div>
      </div>
    </article>
  );
}
