"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useLang } from "@/components/LanguageProvider";

export type DropdownItem = {
  key: string;
  descKey?: string;
  href: string;
};

type Props = {
  labelKey: string;
  basePath: string;
  items: DropdownItem[];
};

export function NavDropdown({ labelKey, basePath, items }: Props) {
  const { t } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  const active = pathname === basePath || pathname.startsWith(basePath + "/");

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
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
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={[
          "group inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2.5 text-[15px] font-semibold tracking-wide transition-colors",
          active
            ? "text-[var(--navy)]"
            : "text-[var(--gray)] hover:text-[var(--navy)]",
        ].join(" ")}
      >
        <span className="relative">
          {t(labelKey)}
          <span
            className={[
              "pointer-events-none absolute -bottom-1 left-0 h-[2px] w-full origin-left rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--brand-blue)] transition-transform duration-300",
              active || open ? "scale-x-100" : "scale-x-0",
            ].join(" ")}
          />
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={[
            "transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
          ].join(" ")}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        id={id}
        role="menu"
        aria-hidden={!open}
        className={[
          "absolute left-1/2 top-[calc(100%+8px)] z-50 w-[340px] -translate-x-1/2 origin-top",
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
          <ul className="p-2.5">
            {items.map((item) => {
              const itemActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={[
                      "group/item flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors",
                      itemActive
                        ? "bg-[var(--brand-ice)]"
                        : "hover:bg-[var(--brand-ice)]/70",
                    ].join(" ")}
                  >
                    <span className="mt-1 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--navy)] to-[var(--brand-blue)] text-white shadow-[0_8px_18px_rgba(11,45,90,0.18)]">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[14px] font-bold leading-tight text-[var(--navy)] group-hover/item:text-[var(--brand-blue)]">
                        {t(item.key)}
                      </span>
                      {item.descKey && (
                        <span className="mt-0.5 text-[12px] leading-snug text-[var(--gray)]">
                          {t(item.descKey)}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function NavDropdownMobile({ labelKey, items }: Omit<Props, "basePath">) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg">
      <button
        type="button"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-[15px] font-semibold text-[var(--gray)] transition-colors hover:bg-[var(--brand-ice)]/60 hover:text-[var(--navy)]"
      >
        <span>{t(labelKey)}</span>
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
          className={[
            "transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
          ].join(" ")}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        className={[
          "overflow-hidden transition-[max-height,opacity] duration-300",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <ul className="ml-2 mt-1 space-y-1 border-l border-[var(--border-soft)] pl-3">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-md px-3 py-2 text-[13.5px] font-semibold text-[var(--gray)] transition-colors hover:bg-[var(--brand-ice)]/70 hover:text-[var(--navy)]"
              >
                {t(item.key)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
