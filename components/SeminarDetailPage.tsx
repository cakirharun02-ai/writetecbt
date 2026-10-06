"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { getSeminar } from "@/lib/seminars";

type Props = { slug: string };

export function SeminarDetailPage({ slug }: Props) {
  const { t, lang } = useLang();
  const seminar = getSeminar(slug);

  if (!seminar) return null;

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
      <div className="relative mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-24">
        <nav
          aria-label="Breadcrumb"
          className="anim-fade-up flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--gray)]"
        >
          <Link href="/" className="hover:text-[var(--navy)]">
            {t("common.breadcrumbHome")}
          </Link>
          <span className="text-[var(--gold)]">›</span>
          <Link href="/seminerler" className="hover:text-[var(--navy)]">
            {t("common.breadcrumbSeminars")}
          </Link>
        </nav>

        <div
          className="anim-fade-up mt-6 flex flex-wrap items-center gap-2.5"
          style={{ animationDelay: "80ms" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--gold)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            {seminar.category[lang]}
          </span>
          {seminar.date ? (
            <span className="inline-flex items-center gap-1.4 rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_8px_18px_rgba(11,45,90,0.18)]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {seminar.date[lang]}
            </span>
          ) : null}
          {seminar.time ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_8px_18px_rgba(11,45,90,0.18)]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {seminar.time[lang]}
            </span>
          ) : null}
          {seminar.location ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_8px_18px_rgba(11,45,90,0.18)]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {seminar.location[lang]}
            </span>
          ) : null}
        </div>

        <h1
          className="anim-fade-up mt-4 font-display text-[clamp(28px,4.6vw,44px)] font-bold leading-tight text-[var(--navy)]"
          style={{ animationDelay: "160ms" }}
        >
          {seminar.title[lang]}
        </h1>
        <p
          className="anim-fade-up mt-5 max-w-2xl text-[16px] leading-relaxed text-[var(--gray)]"
          style={{ animationDelay: "240ms" }}
        >
          {seminar.summary[lang]}
        </p>

        <div
          className="anim-fade-up mt-8 max-w-2xl rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(11,45,90,0.06)] border border-[var(--border-soft)]"
          style={{ animationDelay: "280ms" }}
        >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="text-center sm:text-left">
                <h3 className="font-display text-[18px] font-bold text-[var(--navy)]">
                  {lang === "tr" ? "Seminere Katılın" : "Join the Seminar"}
                </h3>
                <p className="text-[14px] text-[var(--gray)] mt-1.5">
                  {lang === "tr"
                    ? "Yerinizi ayırtmak için hemen başvuru formunu doldurabilirsiniz."
                    : "You can fill out the application form right now to reserve your spot."}
                </p>
              </div>
              {seminar.date ? (
                <a
                  href={`/seminerler/seminer-kayıt-form.html?seminar=${encodeURIComponent(
                    seminar.title.tr
                  )}&date=${encodeURIComponent(seminar.date.tr)}&time=${encodeURIComponent(seminar.time?.tr || "")}&location=${encodeURIComponent(seminar.location?.tr || "")}`}
                  className="whitespace-nowrap inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--gold)] to-[#b58c49] px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_8px_20px_rgba(201,168,76,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(201,168,76,0.4)]"
                >
                  {lang === "tr" ? "Hemen Başvur" : "Apply Now"}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </a>
              ) : (
                <span
                  className="whitespace-nowrap inline-flex items-center gap-2 rounded-full border-2 border-[var(--gold)] bg-[var(--gold)]/10 px-6 py-3 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--gold)] cursor-default shadow-[0_4px_12px_rgba(201,168,76,0.1)]"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {lang === "tr" ? "Çok Yakında" : "Coming Soon"}
                </span>
              )}
            </div>
          </div>
        <div className="mt-12 flex flex-col gap-10">
          {seminar.sections.map((section, i) => (
            <div
              key={`${seminar.slug}-${i}`}
              className="anim-fade-up"
              style={{ animationDelay: `${320 + i * 90}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[var(--gold)] to-[rgba(201,168,76,0.4)]" />
                <h2 className="font-display text-[21px] font-bold leading-tight text-[var(--navy)]">
                  {section.heading[lang]}
                </h2>
              </div>

              {section.intro ? (
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--gray)]">
                  {section.intro[lang]}
                </p>
              ) : null}

              {section.items ? (
                <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {section.items[lang].map((item, j) => (
                    <li
                      key={`${seminar.slug}-${i}-${j}`}
                      className="flex items-start gap-2.5 rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-[14px] leading-snug text-[var(--navy)] shadow-[0_8px_20px_rgba(11,45,90,0.04)]"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--brand-blue)]"
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
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {/* Custom bank details for cost-semineri */}
              {seminar.slug === 'cost-semineri' && section.heading.tr === 'İlk Adımlar' && (
                <div className="mt-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[var(--gold)] to-[rgba(201,168,76,0.4)]" />
                    <h3 className="font-display text-[20px] font-bold text-[var(--navy)]">
                      {lang === 'tr' ? 'Kongre Kayıt Ücreti için Hesap Bilgileri' : 'Account Details for Congress Registration Fee'}
                    </h3>
                  </div>
                  <p className="text-[15px] font-semibold text-[var(--navy)] mb-3">
                    {lang === 'tr' ? 'Türk Lirası Ödemeleri için Hesap Bilgileri' : 'Account Details for Turkish Lira Payments'}
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-[var(--border-soft)] bg-white p-4 sm:p-5 shadow-[0_4px_12px_rgba(11,45,90,0.03)]">
                    <table className="w-full text-left text-[14px] text-[var(--navy)] border-collapse border border-[var(--border-soft)]">
                      <tbody>
                        <tr>
                          <th className="border border-[var(--border-soft)] px-4 py-3 font-bold w-[160px] sm:w-[220px]">Ad Soyad / Unvan:</th>
                          <td className="border border-[var(--border-soft)] px-4 py-3">WRITETEC BİLGİ TEKNOLOJİLERİ DANIŞMANLIK SANAYİ VE TİCARET LİMİTED ŞİRKETİ</td>
                        </tr>
                        <tr>
                          <th className="border border-[var(--border-soft)] px-4 py-3 font-bold">Banka, Şube:</th>
                          <td className="border border-[var(--border-soft)] px-4 py-3">QNB FİNANS BANK, KARABÜK ŞUBESİ</td>
                        </tr>
                        <tr>
                          <th className="border border-[var(--border-soft)] px-4 py-3 font-bold">IBAN:</th>
                          <td className="border border-[var(--border-soft)] px-4 py-3">TR91 0011 1000 0000 0139 2223 88</td>
                        </tr>
                        <tr>
                          <th className="border border-[var(--border-soft)] px-4 py-3 font-bold">HESAP NUMARASI</th>
                          <td className="border border-[var(--border-soft)] px-4 py-3">139222388</td>
                        </tr>
                        <tr>
                          <th className="border border-[var(--border-soft)] px-4 py-3 font-bold">ŞUBE KODU</th>
                          <td className="border border-[var(--border-soft)] px-4 py-3">780</td>
                        </tr>
                        <tr>
                          <th className="border border-[var(--border-soft)] px-4 py-3 font-bold">Döviz Kodu:</th>
                          <td className="border border-[var(--border-soft)] px-4 py-3 font-bold">TRY</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {seminar.price ? (
          <div className="anim-fade-up mt-14" style={{ animationDelay: "440ms" }}>
            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[var(--gold)] to-[rgba(201,168,76,0.4)]" />
              <h2 className="font-display text-[21px] font-bold leading-tight text-[var(--navy)]">
                {lang === "tr" ? "Katılım Ücreti" : "Registration Fee"}
              </h2>
            </div>
            <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] px-8 py-12 text-center shadow-[0_25px_60px_rgba(11,45,90,0.3)] sm:py-14">
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)",
                  }}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(77,168,229,0.22) 0%, transparent 70%)",
                  }}
                  aria-hidden="true"
                />
                <span className="absolute -left-14 top-8 w-48 -rotate-45 bg-gradient-to-r from-[var(--gold)] to-[#b58c49] py-1.5 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)]">
                  {seminar.price.discountLabel[lang]}
                </span>
                <div className="relative">
                  <span className="text-[24px] font-semibold line-through text-white/45">
                    {seminar.price.original}
                  </span>
                  <div
                    className="mt-2 font-display text-[64px] font-bold leading-none tracking-tight text-[var(--gold)] sm:text-[76px]"
                    style={{ textShadow: "0 8px 30px rgba(201,168,76,0.5)" }}
                  >
                    {seminar.price.discounted}
                  </div>
                </div>
              </div>
          </div>
        ) : null}

        {seminar.isFree ? (
          <div className="anim-fade-up mt-14" style={{ animationDelay: "440ms" }}>
            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[var(--gold)] to-[rgba(201,168,76,0.4)]" />
              <h2 className="font-display text-[21px] font-bold leading-tight text-[var(--navy)]">
                {lang === "tr" ? "Katılım Ücreti" : "Registration Fee"}
              </h2>
            </div>
            <div
              className="relative mt-5 overflow-hidden rounded-2xl px-8 py-8 text-center sm:py-10 bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] shadow-[0_20px_40px_rgba(11,45,90,0.25)]"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(77,168,229,0.15) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />
              <div className="relative">
                <div
                  className="font-display text-[48px] font-bold leading-none tracking-tight text-[var(--gold)] sm:text-[56px]"
                  style={{ textShadow: "0 8px 30px rgba(201,168,76,0.3)" }}
                >
                  {lang === "tr" ? "ÜCRETSİZ" : "FREE"}
                </div>
                <p className="mt-2.5 text-[15px] font-medium text-white/70">
                  {lang === "tr"
                    ? "Bu seminer tamamen ücretsizdir."
                    : "This seminar is completely free."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div
          className="anim-fade-up mt-12 flex flex-wrap gap-3"
          style={{ animationDelay: "480ms" }}
        >
          <Link
            href="/seminerler"
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
            {t("common.backSeminars")}
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
