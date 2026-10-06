"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useLang } from "@/components/LanguageProvider";
import { FlagToggle } from "@/components/FlagToggle";
import {
  SOSYAL_BASE,
  SOSYAL_HOME,
  SOSYAL_NAV,
  type SosyalEntry,
  type SosyalLeaf,
} from "@/components/sosyal/nav";

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}
const getScrolled = () => window.scrollY > 8;
const getScrolledServer = () => false;

function isEntryActive(entry: SosyalEntry, pathname: string) {
  if (entry.kind === "link") {
    return entry.href === SOSYAL_HOME
      ? pathname === SOSYAL_HOME
      : pathname.startsWith(entry.href);
  }
  return entry.items.some(
    (it) => !it.external && it.href !== SOSYAL_HOME && pathname.startsWith(it.href),
  );
}

export function SosyalNavbar() {
  const { t } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const mobilePanelId = useId();
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    getScrolled,
    getScrolledServer,
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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link
          href="/"
          onClick={closeMenu}
          className="group inline-flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-[var(--brand-ice)]"
          aria-label={t("brand.full")}
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={48}
            height={48}
            priority
            className="h-12 w-12 object-contain drop-shadow-[0_8px_18px_rgba(11,45,90,0.15)] transition-transform group-hover:-translate-y-0.5"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-[18px] font-bold tracking-tight text-[var(--navy)]">
              WriteTec
            </span>
            <span className="hidden text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)] sm:block">
              {t("pages.sosyal.breadcrumb.series")}
            </span>
          </span>
        </Link>

        <nav aria-label={t("pages.sosyal.nav.ariaNav")} className="hidden items-center gap-0.5 xl:flex">
          {SOSYAL_NAV.map((entry) => {
            const active = isEntryActive(entry, pathname);
            if (entry.kind === "dropdown") {
              return <DesktopDropdown key={entry.key} entry={entry} active={active} />;
            }
            return (
              <Link
                key={entry.href}
                href={entry.href}
                className={[
                  "relative px-3 py-2.5 text-[14px] font-semibold tracking-wide transition-colors",
                  active ? "text-[var(--navy)]" : "text-[var(--gray)] hover:text-[var(--navy)]",
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
          <FlagToggle />
        </nav>

        <div className="flex items-center gap-2 xl:hidden">
          <FlagToggle />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-white text-[var(--navy)] transition-colors hover:bg-[var(--brand-ice)]"
          aria-label={open ? t("pages.sosyal.nav.menuClose") : t("pages.sosyal.nav.menu")}
          aria-expanded={open}
          aria-controls={mobilePanelId}
        >
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
          "overflow-y-auto overflow-x-hidden border-t border-[var(--border-soft)] bg-white/95 backdrop-blur transition-[max-height,opacity] duration-300 xl:hidden",
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <nav
          aria-label={t("pages.sosyal.nav.ariaNavMobile")}
          className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8"
          onClick={closeMenu}
        >
          {SOSYAL_NAV.map((entry) =>
            entry.kind === "dropdown" ? (
              <MobileDropdown key={entry.key} entry={entry} pathname={pathname} />
            ) : (
              <Link
                key={entry.href}
                href={entry.href}
                className={[
                  "flex items-center justify-between rounded-lg px-3 py-3 text-[15px] font-semibold transition-colors",
                  isEntryActive(entry, pathname)
                    ? "bg-[var(--brand-ice)] text-[var(--navy)]"
                    : "text-[var(--gray)] hover:bg-[var(--brand-ice)]/60 hover:text-[var(--navy)]",
                ].join(" ")}
              >
                {t(entry.key)}
              </Link>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}

function DesktopDropdown({ entry, active }: { entry: SosyalEntry & { kind: "dropdown" }; active: boolean }) {
  const { t } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={[
          "group inline-flex items-center gap-1 rounded-md px-3 py-2.5 text-[14px] font-semibold tracking-wide transition-colors",
          active ? "text-[var(--navy)]" : "text-[var(--gray)] hover:text-[var(--navy)]",
        ].join(" ")}
      >
        <span className="relative">
          {t(entry.key)}
          <span
            className={[
              "pointer-events-none absolute -bottom-1 left-0 h-[2px] w-full origin-left rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--brand-blue)] transition-transform duration-300",
              active || open ? "scale-x-100" : "scale-x-0",
            ].join(" ")}
          />
        </span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={["transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        role="menu"
        aria-hidden={!open}
        className={[
          "absolute left-1/2 top-[calc(100%+8px)] z-50 w-[320px] -translate-x-1/2 origin-top",
          "transition-[opacity,transform] duration-200",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        ].join(" ")}
      >
        {/* Caret arrow — positioned perfectly in the center pointing to the menu button */}
        <span
          className="pointer-events-none absolute left-[calc(50%-6px)] top-0 -translate-y-1/2 rotate-45 z-10"
          aria-hidden="true"
        >
          <span className="block h-3 w-3 rounded-tl-sm border-l border-t border-[var(--border-soft)] bg-white" />
        </span>

        {/* Inner container with overflow-hidden to perfectly clip the gold left border on rounded corners */}
        <div className="relative w-full rounded-2xl border border-[var(--border-soft)] bg-white shadow-[0_22px_50px_rgba(11,45,90,0.18)] overflow-hidden">
          <span
            className="pointer-events-none absolute left-0 top-0 h-full w-[4px] bg-gradient-to-b from-[var(--gold)] to-[var(--gold)]/30"
            aria-hidden="true"
          />
          <ul className="p-2">
            {entry.items.map((item) => (
              <li key={item.href}>
                <DropdownLink item={item} active={pathname === item.href} onNavigate={() => setOpen(false)} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DropdownLink({
  item,
  active,
  onNavigate,
}: {
  item: SosyalLeaf;
  active: boolean;
  onNavigate: () => void;
}) {
  const { t } = useLang();
  const className = [
    "group/item flex items-start gap-2.5 rounded-xl px-3 py-2 transition-colors",
    active ? "bg-[var(--brand-ice)]" : "hover:bg-[var(--brand-ice)]/70",
  ].join(" ");
  const inner = (
    <>
      <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] text-white">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </span>
      <span className="text-[13.5px] font-semibold leading-snug text-[var(--navy)] group-hover/item:text-[var(--brand-blue)]">
        {t(item.key)}
      </span>
    </>
  );
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onNavigate}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={item.href} role="menuitem" onClick={onNavigate} className={className}>
      {inner}
    </Link>
  );
}

function MobileDropdown({
  entry,
  pathname,
}: {
  entry: SosyalEntry & { kind: "dropdown" };
  pathname: string;
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-[15px] font-semibold text-[var(--gray)] transition-colors hover:bg-[var(--brand-ice)]/60 hover:text-[var(--navy)]"
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
          strokeLinejoin="round"
          aria-hidden="true"
          className={["transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        className={[
          "overflow-hidden transition-[max-height,opacity] duration-300",
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <ul className="ml-2 mt-1 space-y-1 border-l border-[var(--border-soft)] pl-3">
          {entry.items.map((item) => (
            <li key={item.href}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-md px-3 py-2 text-[13px] font-semibold text-[var(--gray)] hover:bg-[var(--brand-ice)]/70 hover:text-[var(--navy)]"
                >
                  {t(item.key)}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className={[
                    "block rounded-md px-3 py-2 text-[13px] font-semibold transition-colors",
                    pathname === item.href
                      ? "bg-[var(--brand-ice)] text-[var(--navy)]"
                      : "text-[var(--gray)] hover:bg-[var(--brand-ice)]/70 hover:text-[var(--navy)]",
                  ].join(" ")}
                >
                  {t(item.key)}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
