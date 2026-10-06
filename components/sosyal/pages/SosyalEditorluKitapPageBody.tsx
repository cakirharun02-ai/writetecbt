"use client";

import { AkademisyenYayineviCard } from "@/components/AkademisyenYayineviCard";
import { EditorluKitapGrid } from "@/components/EditorluKitapGrid";
import { useLang } from "@/components/LanguageProvider";
import { SosyalSection, SosyalProse } from "@/components/sosyal/SosyalSection";

const P = "pages.sosyal.editorluKitap";
const EYEBROW = "pages.sosyal.eyebrow.publications";

export function SosyalEditorluKitapPageBody() {
  const { t } = useLang();

  return (
    <SosyalSection
      eyebrow={t(EYEBROW)}
      title={t(`${P}.title`)}
      subtitle={t(`${P}.subtitle`)}
      maxWidth="max-w-6xl"
    >
      <SosyalProse>
        <p>{t(`${P}.body`)}</p>
      </SosyalProse>

      <AkademisyenYayineviCard className="mt-6" />

      <EditorluKitapGrid className="mt-8" />
    </SosyalSection>
  );
}
