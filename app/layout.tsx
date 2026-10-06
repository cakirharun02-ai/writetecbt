import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SiteChrome } from "@/components/SiteChrome";
import { Preloader } from "@/components/Preloader";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const source = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WriteTec Bilgi Teknolojileri — Kongrelerimiz",
  description:
    "WriteTec Bilgi Teknolojileri olarak akademik kongrelerden kurumsal etkinliklere kadar dijital çözümler üretiyoruz.",
  icons: {
    icon: [{ url: "/logo-mark.png", type: "image/png" }],
    apple: [{ url: "/logo-mark.png", type: "image/png" }],
    shortcut: "/logo-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${playfair.variable} ${source.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--cream)] text-[var(--navy)]">
        <Preloader />
        <LanguageProvider>
          <SiteChrome>{children}</SiteChrome>
        </LanguageProvider>
      </body>
    </html>
  );
}
