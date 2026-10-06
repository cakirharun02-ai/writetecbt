"use client";

import { useLang } from "@/components/LanguageProvider";

const VALUE_KEYS = [
  "pages.hakkimizda.valueQuality",
  "pages.hakkimizda.valueInnovation",
  "pages.hakkimizda.valueEthics",
  "pages.hakkimizda.valuePartnership",
];

export function AboutPageBody() {
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
      <div className="relative mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-24">
        <p className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--gold)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
          {t("pages.hakkimizda.eyebrow")}
        </p>
        <h1
          className="anim-fade-up mt-5 font-display text-[clamp(32px,5vw,52px)] font-bold leading-tight text-[var(--navy)]"
          style={{ animationDelay: "120ms" }}
        >
          {t("pages.hakkimizda.title")}
        </h1>
        <p
          className="anim-fade-up mt-4 max-w-3xl text-[17px] font-semibold leading-relaxed text-[var(--brand-blue)]"
          style={{ animationDelay: "200ms" }}
        >
          {t("pages.hakkimizda.lead")}
        </p>
        <p
          className="anim-fade-up mt-4 max-w-3xl text-[15.5px] leading-relaxed text-[var(--gray)]"
          style={{ animationDelay: "260ms" }}
        >
          {t("pages.hakkimizda.intro")}
        </p>

        <div
          className="anim-fade-up mt-12 grid grid-cols-1 gap-6 md:grid-cols-2"
          style={{ animationDelay: "360ms" }}
        >
          <article className="relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white p-7 shadow-[0_14px_36px_rgba(11,45,90,0.06)]">
            <span
              className="pointer-events-none absolute left-0 top-0 h-full w-1.5"
              style={{
                background:
                  "linear-gradient(180deg, var(--gold) 0%, rgba(201,168,76,0.4) 100%)",
              }}
              aria-hidden="true"
            />
            <h2 className="font-display text-[22px] font-bold text-[var(--navy)]">
              {t("pages.hakkimizda.missionTitle")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--gray)]">
              {t("pages.hakkimizda.missionBody")}
            </p>
          </article>
          <article className="relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white p-7 shadow-[0_14px_36px_rgba(11,45,90,0.06)]">
            <span
              className="pointer-events-none absolute left-0 top-0 h-full w-1.5"
              style={{
                background:
                  "linear-gradient(180deg, var(--brand-sky) 0%, rgba(77,168,229,0.4) 100%)",
              }}
              aria-hidden="true"
            />
            <h2 className="font-display text-[22px] font-bold text-[var(--navy)]">
              {t("pages.hakkimizda.visionTitle")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--gray)]">
              {t("pages.hakkimizda.visionBody")}
            </p>
          </article>
        </div>

        <div
          className="anim-fade-up mt-12"
          style={{ animationDelay: "440ms" }}
        >
          <h2 className="font-display text-[24px] font-bold text-[var(--navy)]">
            {t("pages.hakkimizda.valuesTitle")}
          </h2>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {VALUE_KEYS.map((key) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3.5 text-[14.5px] font-semibold text-[var(--navy)] shadow-[0_8px_22px_rgba(11,45,90,0.04)]"
              >
                <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/15 text-[var(--gold)]">
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
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
