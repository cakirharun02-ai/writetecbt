import fs from "node:fs";
import path from "node:path";
import { timingSafeEqual } from "node:crypto";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Vercel’de `SERTIFIKA_TOKEN` env yoksa kullanılır (panel ayarı gerekmez).
 * `new5/kongre-apps-script.gs` → `AYARLAR.SERTIFIKA_API_TOKEN` ile birebir aynı kalmalı.
 * Env tanımlıysa her zaman env kullanılır.
 */
const SERTIFIKA_TOKEN_FALLBACK =
  "58622ee5aa627cb194fdb086d30c829d63e0b04ccc4ef22e165d80ad3a6359c3";

type SertifikaPayload = {
  token?: string;
  unvanIsim?: string;
  baslikTr?: string;
  baslikEn?: string;
  formLocale?: string;
  congress?: string;
};

const ASSET_MIMES: Record<string, string> = {
  "/img/writetec-logo.png": "image/png",
  "/img/imza.png": "image/png",
};

function readPublicAssetAsDataUri(publicPath: string, mime: string): string {
  const rel = publicPath.replace(/^\//, "");
  const abs = path.join(process.cwd(), "public", rel);
  const buf = fs.readFileSync(abs);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function compactClassFor(title: string): string {
  return title.length >= 110 ? "em-compact" : "";
}

function resolveTemplatePath(congress?: string): string {
  const key = String(congress || "").trim().toLowerCase();
  if (key === "sosyal") {
    return path.join(process.cwd(), "certificate", "7.kongre-sertifika.html");
  }
  return path.join(process.cwd(), "sertifika_v3.html");
}

function loadTemplate(congress?: string): string {
  const templatePath = resolveTemplatePath(congress);
  let html = fs.readFileSync(templatePath, "utf8");
  for (const [relPath, mime] of Object.entries(ASSET_MIMES)) {
    const dataUri = readPublicAssetAsDataUri(relPath, mime);
    html = html.split(relPath).join(dataUri);
  }
  return html;
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function fillTemplate(payload: SertifikaPayload): string {
  const unvanIsim = String(payload.unvanIsim || "").trim() || "—";
  const baslikTrIn = String(payload.baslikTr || "").trim();
  const baslikEnIn = String(payload.baslikEn || "").trim();
  const turkceBaslik = baslikTrIn || baslikEnIn || "—";
  const ingilizceBaslik = baslikEnIn || baslikTrIn || "—";

  return loadTemplate(payload.congress)
    .replace(/\{\{\s*unvan_isim\s*(\|\s*safe\s*)?\s*\}\}/g, escapeHtml(unvanIsim))
    .replace(/\{\{\s*turkce_baslik_em_class\s*\}\}/g, compactClassFor(turkceBaslik))
    .replace(
      /\{\{\s*ingilizce_baslik_em_class\s*\}\}/g,
      compactClassFor(ingilizceBaslik),
    )
    .replace(/\{\{\s*turkce_baslik\s*\}\}/g, escapeHtml(turkceBaslik))
    .replace(/\{\{\s*ingilizce_baslik\s*\}\}/g, escapeHtml(ingilizceBaslik));
}

async function resolveExecutablePath(): Promise<string> {
  const override = process.env.CHROME_EXECUTABLE_PATH?.trim();
  if (override) return override;
  return await chromium.executablePath();
}

async function renderPng(html: string): Promise<Buffer> {
  const executablePath = await resolveExecutablePath();
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1123, height: 794, deviceScaleFactor: 2 },
    executablePath,
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 30000 });
    try {
      await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 });
    } catch {
      // network idle timeout is best-effort; Google Fonts may already be loaded
    }
    try {
      await page.evaluate(async () => {
        const d = document as Document & { fonts?: { ready: Promise<unknown> } };
        if (d.fonts && d.fonts.ready) {
          await d.fonts.ready;
        }
      });
    } catch {
      // fonts API not available; continue
    }
    const screenshot = await page.screenshot({
      type: "png",
      omitBackground: false,
      clip: { x: 0, y: 0, width: 1123, height: 794 },
    });
    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
}

export async function POST(req: Request): Promise<Response> {
  let payload: SertifikaPayload;
  try {
    payload = (await req.json()) as SertifikaPayload;
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const fromEnv = (process.env.SERTIFIKA_TOKEN || "").trim();
  const expectedToken = fromEnv || SERTIFIKA_TOKEN_FALLBACK;
  const providedToken = String(payload.token || "").trim();
  if (!constantTimeEquals(expectedToken, providedToken)) {
    return new Response("unauthorized", { status: 401 });
  }

  try {
    const html = fillTemplate(payload);
    const png = await renderPng(html);
    return new Response(new Uint8Array(png), {
      status: 200,
      headers: {
        "content-type": "image/png",
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    const msg =
      err instanceof Error
        ? `${err.name}: ${err.message}\n${err.stack ?? ""}`
        : String(err);
    console.error("/api/sertifika render error", msg);
    const debug = req.headers.get("x-sertifika-debug") === "1";
    if (debug) {
      return new Response(msg.substring(0, 4000), {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    return new Response("render error", { status: 500 });
  }
}

export function GET(): Response {
  return new Response("sertifika api: POST only", {
    status: 405,
    headers: { allow: "POST", "content-type": "text/plain; charset=utf-8" },
  });
}
