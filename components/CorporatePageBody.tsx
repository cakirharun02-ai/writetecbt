"use client";

import { useLang } from "@/components/LanguageProvider";

const PILLARS = [
  {
    titleKey: "pages.kurumsal.pillarSmart",
    bodyKey: "pages.kurumsal.pillarSmartBody",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2a4 4 0 0 0-4 4v2a3 3 0 0 0-2 3v3a3 3 0 0 0 3 3v3a2 2 0 0 0 4 0v-1" />
        <path d="M12 2a4 4 0 0 1 4 4v2a3 3 0 0 1 2 3v3a3 3 0 0 1-3 3v3a2 2 0 0 1-4 0v-1" />
      </svg>
    ),
  },
  {
    titleKey: "pages.kurumsal.pillarAcademic",
    bodyKey: "pages.kurumsal.pillarAcademicBody",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    titleKey: "pages.kurumsal.pillarFast",
    bodyKey: "pages.kurumsal.pillarFastBody",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 2L4.09 12.97a1 1 0 0 0 .77 1.65H11l-1 7.38a1 1 0 0 0 1.79.64L20 11h-6.13L15 2z" />
      </svg>
    ),
  },
];

const SERVICES = [
  {
    titleKey: "pages.kurumsal.services.codeAnalysis",
    descKey: "pages.kurumsal.services.codeAnalysisDesc",
  },
  {
    titleKey: "pages.kurumsal.services.penTest",
    descKey: "pages.kurumsal.services.penTestDesc",
  },
  {
    titleKey: "pages.kurumsal.services.webMobile",
    descKey: "pages.kurumsal.services.webMobileDesc",
  },
  {
    titleKey: "pages.kurumsal.services.projectWriting",
    descKey: "pages.kurumsal.services.projectWritingDesc",
  },
  {
    titleKey: "pages.kurumsal.services.ai",
    descKey: "pages.kurumsal.services.aiDesc",
  },
  {
    titleKey: "pages.kurumsal.services.organization",
    descKey: "pages.kurumsal.services.organizationDesc",
  },
];

export function CorporatePageBody() {
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
          {t("pages.kurumsal.eyebrow")}
        </p>
        <h1
          className="anim-fade-up mt-5 font-display text-[clamp(32px,5vw,52px)] font-bold leading-tight text-[var(--navy)]"
          style={{ animationDelay: "120ms" }}
        >
          {t("pages.kurumsal.title")}
        </h1>
        <p
          className="anim-fade-up mt-4 max-w-3xl text-[17px] font-semibold italic leading-relaxed text-[var(--brand-blue)]"
          style={{ animationDelay: "200ms" }}
        >
          {t("pages.kurumsal.lead")}
        </p>
        <p
          className="anim-fade-up mt-4 max-w-3xl text-[15.5px] leading-relaxed text-[var(--gray)]"
          style={{ animationDelay: "260ms" }}
        >
          {t("pages.kurumsal.intro")}
        </p>

        <div className="mt-14">
          <h2
            className="anim-fade-up font-display text-[24px] font-bold text-[var(--navy)]"
            style={{ animationDelay: "340ms" }}
          >
            {t("pages.kurumsal.pillarsTitle")}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <article
                key={p.titleKey}
                className="anim-fade-up relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_30px_rgba(11,45,90,0.06)]"
                style={{ animationDelay: `${400 + i * 80}ms` }}
              >
                <span
                  className="pointer-events-none absolute left-0 top-0 h-full w-1.5"
                  style={{
                    background:
                      "linear-gradient(180deg, var(--gold) 0%, rgba(201,168,76,0.35) 100%)",
                  }}
                  aria-hidden="true"
                />
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(11,45,90,0.22)]">
                  {p.icon}
                </span>
                <h3 className="mt-4 font-display text-[19px] font-bold text-[var(--navy)]">
                  {t(p.titleKey)}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--gray)]">
                  {t(p.bodyKey)}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h2
            className="anim-fade-up font-display text-[24px] font-bold text-[var(--navy)]"
            style={{ animationDelay: "640ms" }}
          >
            {t("pages.kurumsal.servicesTitle")}
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SERVICES.map((s, i) => (
              <li
                key={s.titleKey}
                className="anim-fade-up flex items-start gap-3 rounded-xl border border-[var(--border-soft)] bg-white p-4 shadow-[0_8px_22px_rgba(11,45,90,0.04)]"
                style={{ animationDelay: `${700 + i * 60}ms` }}
              >
                <span className="mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-ice)] text-[var(--brand-blue)]">
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
                <div className="min-w-0">
                  <p className="font-display text-[15.5px] font-bold leading-tight text-[var(--navy)]">
                    {t(s.titleKey)}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--gray)]">
                    {t(s.descKey)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
