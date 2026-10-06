import { CategoryGrid } from "@/components/CategoryGrid";

export default function Page() {
  return (
    <CategoryGrid
      eyebrowKey="pages.kongrelerimiz.eyebrow"
      titleKey="pages.kongrelerimiz.title"
      leadKey="pages.kongrelerimiz.lead"
      items={[
        {
          titleKey: "active2.congressTitle",
          descKey: "active2.congressTagline",
          href: "/kongrelerimiz/sosyal-saglik-bilimleri/guncel",
        },
        {
          titleKey: "series.sosyalSaglik.title",
          descKey: "series.sosyalSaglik.description",
          href: "/kongrelerimiz/sosyal-saglik",
        },
        {
          titleKey: "series.muhendislik.title",
          descKey: "series.muhendislik.description",
          href: "/kongrelerimiz/muhendislik",
        },
      ]}
    />
  );
}
