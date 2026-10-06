"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { SOSYAL_BASE } from "@/components/sosyal/nav";

const P = "pages.sosyal.home";

const DATE_KEYS = [
  { label: "dateAbstract", value: "dateAbstractValue" },
  { label: "dateEarly", value: "dateEarlyValue" },
  { label: "dateLate", value: "dateLateValue" },
  { label: "dateProgram", value: "dateProgramValue" },
  { label: "dateFull", value: "dateFullValue" },
  { label: "dateCongress", value: "dateCongressValue" },
] as const;

const QUICK_KEYS = [
  { key: "quickBasvuru", href: `${SOSYAL_BASE}/basvuru-formu` },
  { key: "quickKayit", href: `${SOSYAL_BASE}/kayit-bilgisi` },
  { key: "quickKatilim", href: `${SOSYAL_BASE}/katilim-kurallari` },
  { key: "quickSurec", href: `${SOSYAL_BASE}/basvuru-sureci` },
  { key: "quickKonaklama", href: `${SOSYAL_BASE}/konaklama` },
] as const;

const ABOUT_KEYS = ["aboutP1", "aboutP2", "aboutP3", "aboutP4", "aboutP5", "aboutP6"] as const;

export function SosyalHomePageBody() {
  const { t } = useLang();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[var(--navy)] via-[var(--navy-2)] to-[var(--brand-blue)] text-white">
        <div
          className="anim-drift pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(900px 360px at 15% 12%, rgba(77,168,229,0.30) 0%, transparent 55%), radial-gradient(760px 320px at 88% 18%, rgba(201,168,76,0.22) 0%, transparent 60%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" />

        <div className="relative mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <span className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/55 bg-white/5 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.26em] text-[var(--gold-light)] backdrop-blur">
            <span className="anim-pulse-ring inline-block h-2 w-2 rounded-full bg-[var(--gold)]" />
            {t(`${P}.badge`)}
          </span>
          <h1
            className="anim-fade-up mt-6 font-display text-[clamp(28px,5vw,52px)] font-bold leading-tight"
            style={{ animationDelay: "120ms" }}
          >
            {t(`${P}.title`)}
          </h1>
          <p
            className="anim-fade-up mt-5 text-[16px] font-semibold text-[var(--gold-light)]"
            style={{ animationDelay: "200ms" }}
          >
            {t(`${P}.theme`)}
          </p>
          <p
            className="anim-fade-up mt-3 inline-flex items-center gap-2 text-[15px] font-semibold text-white/85"
            style={{ animationDelay: "260ms" }}
          >
            {t(`${P}.dates`)}
          </p>
          <div
            className="anim-fade-up mt-9 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "320ms" }}
          >
            <Link
              href={`${SOSYAL_BASE}/basvuru-formu`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-3 text-[12.5px] font-bold uppercase tracking-[0.18em] text-[var(--navy)] shadow-[0_14px_30px_rgba(201,168,76,0.35)] transition-all hover:-translate-y-0.5"
            >
              {t(`${P}.ctaApply`)}
            </Link>
            <Link
              href={`${SOSYAL_BASE}/konular`}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-[12.5px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/10"
            >
              {t(`${P}.ctaTopics`)}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative bg-[var(--cream)] py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 sm:px-8 lg:grid-cols-3">
          <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-7 shadow-[0_14px_32px_rgba(11,45,90,0.06)]">
            <h2 className="font-display text-[20px] font-bold text-[var(--navy)]">{t(`${P}.datesTitle`)}</h2>
            <ul className="mt-4 space-y-2.5">
              {DATE_KEYS.map((d) => (
                <li
                  key={d.label}
                  className="flex items-baseline justify-between gap-3 border-b border-[var(--border-soft)] pb-2 text-[14px] last:border-0"
                >
                  <span className="text-[var(--gray)]">{t(`${P}.${d.label}`)}</span>
                  <span className="font-semibold text-[var(--brand-blue)]">{t(`${P}.${d.value}`)}</span>
                </li>
              ))}
            </ul>
            <Link href={`${SOSYAL_BASE}/takvim`} className="mt-4 inline-block text-[13px] font-bold text-[var(--brand-blue)] hover:underline">
              {t(`${P}.allCalendar`)}
            </Link>
          </article>

          <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-7 shadow-[0_14px_32px_rgba(11,45,90,0.06)]">
            <h2 className="font-display text-[20px] font-bold text-[var(--navy)]">{t(`${P}.quickTitle`)}</h2>
            <div className="mt-4 flex flex-col gap-2.5">
              {QUICK_KEYS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex items-center justify-between rounded-xl border border-[var(--border-soft)] px-4 py-3 text-[14px] font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--brand-ice)]"
                >
                  {t(`${P}.${l.key}`)}
                  <span className="text-[var(--gold)] transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-7 shadow-[0_14px_32px_rgba(11,45,90,0.06)]">
            <h2 className="font-display text-[20px] font-bold text-[var(--navy)]">{t(`${P}.pubTitle`)}</h2>
            <ul className="mt-4 space-y-2.5 text-[14px] text-[var(--gray)]">
              <li>
                {t(`${P}.pubScopus`)}
                <p className="mt-1 pl-4">
                  <a
                    href="https://dergipark.org.tr/en/pub/uiecd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--brand-blue)] hover:underline"
                  >
                    {t("pages.sosyal.makale.scopusJournal")}
                  </a>
                </p>
              </li>
              <li>{t(`${P}.pubBildiri`)}</li>
              <li>{t(`${P}.pubTrDizin`)}</li>
              <li>{t(`${P}.pubOther`)}</li>
              <li>{t(`${P}.pubBook`)}</li>
            </ul>
            <Link href={`${SOSYAL_BASE}/makale`} className="mt-4 inline-block text-[13px] font-bold text-[var(--brand-blue)] hover:underline">
              {t(`${P}.pubDetails`)}
            </Link>
          </article>
        </div>

        <div className="mx-auto mt-16 max-w-4xl px-5 sm:px-8">
          <h2 className="text-center font-display text-[clamp(24px,3.4vw,34px)] font-bold uppercase leading-tight text-[var(--navy)]">
            {t(`${P}.aboutTitle`).replace("WriteTec", "WRITETEC")}
          </h2>
          <div className="mt-8 space-y-5 text-justify text-[15.5px] leading-relaxed text-[var(--gray)]">
            {ABOUT_KEYS.map((key) => (
              <p key={key}>{t(`${P}.${key}`)}</p>
            ))}
            <blockquote className="border-l-4 border-[var(--brand-blue)] bg-white px-5 py-4 italic text-[var(--navy)]">
              {t(`${P}.quote`)}
            </blockquote>
            <p>{t(`${P}.closing1`)}</p>
            <p className="font-semibold text-[var(--navy)]">{t(`${P}.closingRegards`)}</p>
            <p className="font-bold text-[var(--navy)]">{t(`${P}.closingBoard`)}</p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`${SOSYAL_BASE}/konular`}
              className="rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] px-6 py-3 text-[12.5px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:-translate-y-0.5"
            >
              {t(`${P}.ctaTopics`)}
            </Link>
            <Link
              href={`${SOSYAL_BASE}/takvim`}
              className="rounded-full border border-[var(--navy)]/15 bg-white px-6 py-3 text-[12.5px] font-bold uppercase tracking-[0.16em] text-[var(--navy)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-ice)]"
            >
              {t(`${P}.ctaCalendar`)}
            </Link>
            <Link
              href={`${SOSYAL_BASE}/basvuru-sureci`}
              className="rounded-full border border-[var(--navy)]/15 bg-white px-6 py-3 text-[12.5px] font-bold uppercase tracking-[0.16em] text-[var(--navy)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-ice)]"
            >
              {t(`${P}.ctaProcess`)}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
