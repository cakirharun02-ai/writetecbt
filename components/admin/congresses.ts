import type { Congress } from "./types";

// Aktif kongreler. id, app/api/admin route'larındaki congress parametresi ve
// lib/admin.ts CONGRESS_EXEC_ENV eşlemesiyle aynı olmalı.
export const CONGRESSES: Congress[] = [
  {
    id: "saglik-bilimleri",
    title: "1. Sağlık Bilimleri Kongresi",
    subtitle: "Uluslararası WRITETEC — Yapay Zeka Çağında Sağlık Bilimleri",
    date: "15-16 Ağustos 2026 · Online",
    color: "#0b2d5a",
  },
  {
    id: "sosyal-saglik-bilimleri",
    title: "7. Sosyal Bilimler ve Sağlık Bilimleri Kongresi",
    subtitle: "Uluslararası WRITETEC — Yapay Zeka Çağında Sosyal Bilimler ve Sağlık Bilimleri",
    date: "28 Ağustos – 2 Eylül 2026 · Alanya + Online",
    color: "#2f67b8",
  },
];
