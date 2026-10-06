// Admin paneli veri tipleri — Apps Script adminList JSON'u ile birebir aynı alanlar.

export interface Author {
  unvan: string;
  ad: string;
  soyad: string;
  universite: string;
  fakulte: string;
  bolum: string;
  orcid: string;
  email: string;
  telefon: string;
  sehir: string;
  ulke: string;
}

export type Durum = "Beklemede" | "Onaylandı" | "Reddedildi";

export interface Participant {
  ref: string;
  timestamp: string;
  unvan: string;
  ad: string;
  soyad: string;
  adSoyad: string;
  authors: Author[];
  universite: string;
  fakulte: string;
  bolum: string;
  email: string;
  telefon: string;
  sehir: string;
  ulke: string;
  bilimAlani: string;
  /** Hibrit kongrelerde: "Yüz yüze (Alanya)" / "Online (Çevrimiçi)"; diğerlerinde boş */
  katilimSekli: string;
  yayinTercihi: string;
  baslikTr: string;
  ozetTr: string;
  keywordsTr: string;
  tezNotu: string;
  baslikEn: string;
  ozetEn: string;
  keywordsEn: string;
  formLocale: "tr" | "en";
  klasorUrl: string;
  durum: Durum;
  kararTarihi: string;
  duzeltmeNotu: string;
  /** Düzeltme sonrası yeniden gönderim sayısı (0 = ilk başvuru) */
  revizyon: number;
  /** Ödeme bildirimi — yalnızca bunu destekleyen kongrelerde dolu gelir (şu an: sosyal-saglik-bilimleri). */
  odemeDurumu?: OdemeDurumu | "";
  dekontDosyaId?: string;
  dekontYuklemeTarihi?: string;
  odemeOnayTarihi?: string;
  dekontBeyan?: string;
}

export type OdemeDurumu = "Onay Bekliyor" | "Ödendi" | "Reddedildi";

export const ODEME_DURUM_STYLE: Record<OdemeDurumu, React.CSSProperties> = {
  "Onay Bekliyor": { background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" },
  Ödendi: { background: "#f0fdf4", color: "#2d6a4f", border: "1px solid #86efac" },
  Reddedildi: { background: "#fef2f2", color: "#9b2335", border: "1px solid #fecaca" },
};

export function dekontDriveUrl(fileId: string | undefined): string {
  const id = String(fileId || "").trim();
  return id ? `https://drive.google.com/file/d/${id}/view` : "";
}

export interface Congress {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  color: string;
}

export interface CongressData {
  participants: Participant[];
  loading: boolean;
  error: string;
}

export const DURUM_STYLE: Record<Durum, React.CSSProperties> = {
  Beklemede: { background: "#fef9ec", color: "#b45309", border: "1px solid #fde68a" },
  Onaylandı: { background: "#f0fdf4", color: "#2d6a4f", border: "1px solid #86efac" },
  Reddedildi: { background: "#fef2f2", color: "#9b2335", border: "1px solid #fecaca" },
};

export function normalizeDurum(s: string): Durum {
  if (s === "Onaylandı" || s === "Reddedildi") return s;
  return "Beklemede";
}

export function participantTitle(p: Participant): string {
  return (p.formLocale === "en" ? p.baslikEn || p.baslikTr : p.baslikTr || p.baslikEn) || "—";
}
