"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { useLang } from "@/components/LanguageProvider";
import { FlagToggle } from "@/components/FlagToggle";
import { NavDropdown, NavDropdownMobile, type DropdownItem } from "@/components/NavDropdown";

type LeafItem = { kind: "link"; key: string; href: string };
type ParentItem = {
  kind: "dropdown";
  key: string;
  basePath: string;
  items: DropdownItem[];
};
type NavEntry = LeafItem | ParentItem;

const CONGRESS_ITEMS: DropdownItem[] = [
  {
    key: "nav.dropdown.sosyalSaglik",
    descKey: "nav.dropdown.sosyalSaglikDesc",
    href: "/kongrelerimiz/sosyal-saglik",
  },
  {
    key: "nav.dropdown.muhendislik",
    descKey: "nav.dropdown.muhendislikDesc",
    href: "/kongrelerimiz/muhendislik",
  },
];

const PUBLICATION_ITEMS: DropdownItem[] = [
  {
    key: "nav.dropdown.dergi",
    descKey: "nav.dropdown.dergiDesc",
    href: "/yayin-imkanlari/dergi",
  },
  {
    key: "nav.dropdown.kitap",
    descKey: "nav.dropdown.kitapDesc",
    href: "/yayin-imkanlari/kitap",
  },
  {
    key: "nav.dropdown.bildiri",
    descKey: "nav.dropdown.bildiriDesc",
    href: "/yayin-imkanlari/bildiri",
  },
];

const NAV_ENTRIES: NavEntry[] = [
  { kind: "link", key: "nav.home", href: "/" },
  { kind: "link", key: "nav.corporate", href: "/kurumsal" },
  { kind: "link", key: "nav.about", href: "/hakkimizda" },
  {
    kind: "dropdown",
    key: "nav.congresses",
    basePath: "/kongrelerimiz",
    items: CONGRESS_ITEMS,
  },
  {
    kind: "dropdown",
    key: "nav.publications",
    basePath: "/yayin-imkanlari",
    items: PUBLICATION_ITEMS,
  },
  { kind: "link", key: "nav.seminars", href: "/seminerler" },
  { kind: "link", key: "nav.contact", href: "/iletisim" },
];

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

function getScrolledSnapshot() {
  return window.scrollY > 8;
}

function getScrolledServerSnapshot() {
  return false;
}

export function Navbar() {
  const { t } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const mobilePanelId = useId();
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    getScrolledSnapshot,
    getScrolledServerSnapshot,
  );

  const closeMenu = () => setOpen(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-[0_10px_28px_rgba(11,45,90,0.08)]"
          : "bg-white/75 backdrop-blur",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/60 to-transparent" />
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/"
          onClick={closeMenu}
          className="group inline-flex items-center gap-3.5 rounded-xl px-2 py-1 transition-colors hover:bg-[var(--brand-ice)]"
          aria-label={t("brand.full")}
        >
          <span className="relative inline-flex h-14 w-14 items-center justify-center">
            <Image
              src="/logo-mark.png"
              alt=""
              width={56}
              height={56}
              priority
              className="h-14 w-14 object-contain drop-shadow-[0_8px_18px_rgba(11,45,90,0.15)] transition-transform group-hover:-translate-y-0.5"
            />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-[22px] font-bold tracking-tight text-[var(--navy)]">
              WriteTec
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--gold)] sm:block">
              {t("brand.kicker")}
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 lg:flex"
        >
          {NAV_ENTRIES.map((entry) => {
            if (entry.kind === "dropdown") {
              return (
                <NavDropdown
                  key={entry.key}
                  labelKey={entry.key}
                  basePath={entry.basePath}
                  items={entry.items}
                />
              );
            }
            const active =
              entry.href === "/"
                ? pathname === "/"
                : pathname.startsWith(entry.href);
            return (
              <Link
                key={entry.href}
                href={entry.href}
                className={[
                  "relative whitespace-nowrap px-3 py-2.5 text-[15px] font-semibold tracking-wide transition-colors",
                  active
                    ? "text-[var(--navy)]"
                    : "text-[var(--gray)] hover:text-[var(--navy)]",
                ].join(" ")}
              >
                {t(entry.key)}
                <span
                  className={[
                    "pointer-events-none absolute inset-x-3 -bottom-0.5 h-[2px] origin-left rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--brand-blue)] transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0",
                  ].join(" ")}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <FlagToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-white text-[var(--navy)] transition-colors hover:bg-[var(--brand-ice)] lg:hidden"
            aria-label={open ? t("nav.close") : t("nav.menu")}
            aria-expanded={open}
            aria-controls={mobilePanelId}
          >
            <span className="sr-only">{open ? t("nav.close") : t("nav.menu")}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6l-12 12" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id={mobilePanelId}
        className={[
          "overflow-y-auto overflow-x-hidden border-t border-[var(--border-soft)] bg-white/95 backdrop-blur transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <nav
          aria-label="Mobile"
          className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8"
          onClick={closeMenu}
        >
          {NAV_ENTRIES.map((entry) => {
            if (entry.kind === "dropdown") {
              return (
                <NavDropdownMobile
                  key={entry.key}
                  labelKey={entry.key}
                  items={entry.items}
                />
              );
            }
            const active =
              entry.href === "/"
                ? pathname === "/"
                : pathname.startsWith(entry.href);
            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={closeMenu}
                className={[
                  "flex items-center justify-between rounded-lg px-3 py-3 text-[15px] font-semibold transition-colors",
                  active
                    ? "bg-[var(--brand-ice)] text-[var(--navy)]"
                    : "text-[var(--gray)] hover:bg-[var(--brand-ice)]/60 hover:text-[var(--navy)]",
                ].join(" ")}
              >
                <span>{t(entry.key)}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
