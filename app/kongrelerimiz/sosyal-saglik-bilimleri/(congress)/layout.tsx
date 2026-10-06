import type { Metadata } from "next";
import { SosyalNavbar } from "@/components/sosyal/SosyalNavbar";
import { SosyalFooter } from "@/components/sosyal/SosyalFooter";

export const metadata: Metadata = {
  title: "7. Uluslararası WriteTec Yapay Zeka Çağında Sosyal Bilimler ve Sağlık Bilimleri Kongresi",
  description:
    "7. Uluslararası WriteTec Yapay Zeka Çağında Sosyal Bilimler ve Sağlık Bilimleri Kongresi — sosyal bilimler ve sağlık bilimleri odaklı bilimsel paylaşım ve yayın olanakları. 28 Ağustos – 2 Eylül 2026, Noxinn Club Hotel Alanya, Antalya.",
};

export default function SosyalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SosyalNavbar />
      <main className="flex-1">{children}</main>
      <SosyalFooter />
    </>
  );
}
