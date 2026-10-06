import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Kitap bölümü gönderim formu HTML'i (kitap-form/kitap-bolum-formu.html) birebir sunulur.
 * Apps Script gönderim mantığı (APPS_SCRIPT_URL) ve inline script DEĞİŞTİRİLMEZ;
 * yalnızca göreli `logo.png` varlık yolu sunulan konuma (/kitap-form/logo.png) yeniden yazılır.
 */
export function GET() {
  const filePath = path.join(process.cwd(), "kitap-form", "kitap-bolum-formu.html");
  const html = fs.readFileSync(filePath, "utf8");

  const rewritten = html.replaceAll('src="logo.png"', 'src="/kitap-form/logo.png"');

  return new Response(rewritten, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
