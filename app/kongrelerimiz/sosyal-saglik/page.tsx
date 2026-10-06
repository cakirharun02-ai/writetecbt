import { CongressSeriesPage, type Edition } from "@/components/CongressSeriesPage";

const editions: Edition[] = [
  {
    number: 6,
    editionKey: "past.editionLabel.sixth",
    status: "past",
    image: "/img/congress_6.png",
    pdf: "/pdf/6.SosyalSaglikBilimleri-BildirKitabi.pdf",
  },
  {
    number: 5,
    editionKey: "past.editionLabel.fifth",
    status: "past",
    image: "/img/congress_5.png",
    pdf: "/pdf/WRITETEC-bildiri-kitabi-v5.pdf",
  },
  {
    number: 4,
    editionKey: "past.editionLabel.fourth",
    status: "past",
    image: "/img/congress_4.png",
    pdf: "/pdf/4.SosyalSaglikBilimleri-BildirKitabi.pdf",
    abstractPdf: "/pdf/4.KongreOzet.pdf",
  },
  {
    number: 3,
    editionKey: "past.editionLabel.third",
    status: "past",
    image: "/img/congress_3.png",
    pdf: "/pdf/3.SosyalSaglikBilimleri-BildiriKitabi.pdf",
    abstractPdf: "/pdf/3.KongreOzet.pdf",
  },
  {
    number: 2,
    editionKey: "past.editionLabel.second",
    status: "past",
    image: "/img/congress_2.png",
    pdf: "/pdf/2.SosyalSaglikBilimler-BildiriKitabi.pdf",
    abstractPdf: "/pdf/2.KongreOzet.pdf",
  },
  {
    number: 1,
    editionKey: "past.editionLabel.first",
    status: "past",
    image: "/img/congress_1.png",
    pdf: "/pdf/1.SosyalSaglikBilimler-BildiriKitabi.pdf",
    abstractPdf: "/pdf/1.KongreOzet.pdf",
  },
];

export default function Page() {
  return (
    <CongressSeriesPage
      seriesNs="series.sosyalSaglik"
      seriesNameKey="past.seriesName"
      editions={editions}
      pastOnly
    />
  );
}
