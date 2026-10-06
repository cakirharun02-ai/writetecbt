// Admin paneli sunucu tarafı yardımcıları: oturum imzalama/doğrulama ve
// Apps Script (kongre otomasyonu) çağrıları. Yalnızca route handler'lardan kullanılır.
// Tüm yapılandırma bilinçli olarak kodda tutulur (env değişkeni kullanılmaz).
import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 saat

/** Panel giriş bilgileri (sunucu tarafında doğrulanır; tarayıcıya gönderilmez). */
export const ADMIN_USER = "admin";
export const ADMIN_PASS = "WRITETEC2026";

/**
 * Apps Script admin API anahtarı — her iki Apps Script projesindeki
 * AYARLAR.ADMIN_API_ANAHTARI ile birebir aynı olmalı.
 */
export const ADMIN_GS_KEY = "2d3ad65c64fbb40427649802747c3041cc95674c378302be";

/**
 * Kongre kimliği → Apps Script web uygulaması /exec URL'si.
 * Kongre kimlikleri components/admin/congresses.ts ile aynı olmalı.
 * Apps Script'te yeni dağıtım "Dağıtımı yönet → mevcut dağıtımı düzenle → yeni sürüm"
 * ile yapılırsa URL değişmez; yeni dağıtım oluşturulursa buradaki URL güncellenmeli.
 */
const CONGRESS_EXEC_URLS: Record<string, string> = {
  "saglik-bilimleri":
    "https://script.google.com/macros/s/AKfycbwKQQllyVxiJuPFCXeQTbrM_vjr6wxtXT5rH-8XPjRHD7is67EL9-GIz1HFvLcFY01-/exec",
  "sosyal-saglik-bilimleri":
    // GEÇİCİ — TEST: yerelde ayrı test Apps Script projesine işaret ediyor.
    // Canlıya çıkmadan önce bunu tekrar production URL'sine döndürün:
    // https://script.google.com/macros/s/AKfycbyK0OFUJxUdHR1w49WPHbww08Cbua_igmQEX8_hCX2i_5VZBcJoJFfVbbw3nXHreXFFTw/exec
    "https://script.google.com/macros/s/AKfycbzW69K5jGl_tS3wyd70YyIyaKTgCmqTjPGvz43KjWzYSiW11ITa3TzHZbpba8Jxv73r/exec",
};

function sessionSecret(): string {
  // Paroladan türetilir; parola değişirse açık oturumlar düşer.
  return "WRITETEC-admin-session:" + ADMIN_PASS;
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

/** İmzalı, süreli oturum değeri üretir: `<expiryMs>.<hmac>` */
export function createSessionToken(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  return `${exp}.${sign(`admin:${exp}`)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  const raw = String(token || "").trim();
  const dot = raw.indexOf(".");
  if (dot <= 0) return false;
  const expStr = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = sign(`admin:${expStr}`);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function congressExecUrl(congressId: string): string | null {
  return CONGRESS_EXEC_URLS[String(congressId || "").trim()] || null;
}

export type GsResult = { ok: boolean; error?: string; [key: string]: unknown };

/**
 * Apps Script web uygulamasına admin aksiyonu gönderir.
 * Apps Script doPost e.parameter'ı form-encoded gövdeden okur; 302 yönlendirmesi
 * (script.googleusercontent.com) fetch tarafından otomatik izlenir.
 */
export async function callAppsScript(
  execUrl: string,
  params: Record<string, string>
): Promise<GsResult> {
  const body = new URLSearchParams({ ...params, adminKey: ADMIN_GS_KEY });
  const resp = await fetch(execUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });
  const text = await resp.text();
  if (!resp.ok) {
    return { ok: false, error: `Apps Script HTTP ${resp.status}: ${text.slice(0, 200)}` };
  }
  try {
    return JSON.parse(text) as GsResult;
  } catch {
    return { ok: false, error: `Apps Script JSON dönmedi: ${text.slice(0, 200)}` };
  }
}
