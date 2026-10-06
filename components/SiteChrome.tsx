"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const CONGRESS_PREFIXES = [
  "/kongrelerimiz/sosyal-saglik-bilimleri",
];

const NO_CHROME_PREFIXES = ["/admin"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCongressSite = CONGRESS_PREFIXES.some(
    (prefix) =>
      pathname.startsWith(`${prefix}/`) && pathname !== prefix,
  );

  const isNoChrome = NO_CHROME_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isCongressSite || isNoChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
