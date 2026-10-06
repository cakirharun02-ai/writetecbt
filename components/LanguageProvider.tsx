"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { getTranslation, type Lang } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "writetecbt.lang";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((cb) => cb());
}

function subscribeLang(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getClientSnapshot(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "tr" || stored === "en") return stored;
  } catch {
    // ignore
  }
  return "tr";
}

function getServerSnapshot(): Lang {
  return "tr";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(
    subscribeLang,
    getClientSnapshot,
    getServerSnapshot,
  );

  const setLang = useCallback((next: Lang) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    } catch {
      // ignore
    }
    emit();
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "tr" ? "en" : "tr");
  }, [lang, setLang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      toggle,
      t: (key: string) => getTranslation(lang, key),
    }),
    [lang, setLang, toggle],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLang must be used within LanguageProvider");
  }
  return ctx;
}
