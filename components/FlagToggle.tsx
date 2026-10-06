"use client";

import Image from "next/image";
import { useLang } from "@/components/LanguageProvider";
import type { Lang } from "@/lib/i18n";

type Option = {
  code: Lang;
  src: string;
  alt: string;
  label: string;
};

const options: Option[] = [
  { code: "tr", src: "/flag-tr.svg", alt: "Türkçe", label: "TR" },
  { code: "en", src: "/flag-gb.svg", alt: "English", label: "EN" },
];

export function FlagToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLang();
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-[var(--border-soft)] bg-white/70 p-1 shadow-[0_8px_18px_rgba(11,45,90,0.06)] backdrop-blur"
      role="group"
      aria-label={t("common.langTr") + " / " + t("common.langEn")}
    >
      {options.map((opt) => {
        const active = lang === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLang(opt.code)}
            aria-pressed={active}
            aria-label={opt.alt}
            className={[
              "group flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] transition-all",
              active
                ? "bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(11,45,90,0.25)]"
                : "text-[var(--gray)] hover:text-[var(--navy)]",
            ].join(" ")}
          >
            <span
              className={[
                "relative inline-flex h-[14px] w-[22px] overflow-hidden rounded-[3px] ring-1 ring-black/10 transition-opacity",
                active ? "opacity-100" : "opacity-70 group-hover:opacity-100",
              ].join(" ")}
            >
              <Image
                src={opt.src}
                alt=""
                width={22}
                height={14}
                className="h-full w-full object-cover"
                priority
              />
            </span>
            {!compact && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
