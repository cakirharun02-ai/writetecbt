import { CategoryGrid } from "@/components/CategoryGrid";

export default function Page() {
  return (
    <CategoryGrid
      eyebrowKey="publications.eyebrow"
      titleKey="publications.title"
      leadKey="publications.subtitle"
      items={[
        {
          titleKey: "publications.dergi.title",
          descKey: "publications.dergi.body",
          href: "/yayin-imkanlari/dergi",
        },
        {
          titleKey: "publications.kitap.title",
          descKey: "publications.kitap.body",
          href: "/yayin-imkanlari/kitap",
        },
        {
          titleKey: "publications.bildiri.title",
          descKey: "publications.bildiri.body",
          href: "/yayin-imkanlari/bildiri",
        },
      ]}
      badgeKey="publications.cta"
    />
  );
}
