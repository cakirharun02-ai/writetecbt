"use client";

import { useLang } from "@/components/LanguageProvider";

/** Kitap kapak görselleri — `public/saglik/` */
export const EDITORLU_KITAP_COVERS = [
  "kitap15.jpg",
  "kitap17.jpg",
  "kitap10.jpg",
  "kitap11.jpg",
  "kitap12.jpg",
  "kitap14.jpg",
  "kitap18.jpg",
  "kitap16.jpg",
  "kitap19.jpg",
  "kitap1.jpg",
  "kitap22.jpg",
  "3.kitap-1.jpg",
  "4.kitap-1.jpg",
  "5.kitap-1.jpg",
  "kitap3.jpg",
  "kitap6.jpg",
  "kitap4.jpg",
  "kitap5.jpg",
  "kitap8.jpg",
  "kitap2.jpg",
  "kitap7.jpg",
  "kitap9.jpg",
] as const;

type Props = {
  className?: string;
};

export function EditorluKitapGrid({ className = "mt-10" }: Props) {
  const { t } = useLang();
  const alt = t("pages.sosyal.common.bookCoverAlt");

  return (
    <div
      className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${className}`}
    >
      {EDITORLU_KITAP_COVERS.map((file) => (
        <div
          key={file}
          className="overflow-hidden rounded-xl border border-[var(--navy)]/10 bg-white shadow-[0_8px_22px_rgba(11,45,90,0.06)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/saglik/${file}`}
            alt={alt}
            className="aspect-[3/4] h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
