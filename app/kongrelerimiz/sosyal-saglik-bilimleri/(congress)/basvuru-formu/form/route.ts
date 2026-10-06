import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 7. Uluslararası WriteTec Sosyal Bilimler ve Sağlık Bilimleri Kongresi başvuru formu.
 * Kaynak: sosyal-form/kongre-basvuru-formu.html (saglik formundan AYRI bir kopyadır;
 * saglik formu asla değiştirilmez). Apps Script gönderim mantığı korunur; yalnızca
 * göreli `img/...` varlık yolları sunulan konuma (/sosyal-form/...) yeniden yazılır.
 */
export function GET() {
  const filePath = path.join(process.cwd(), "sosyal-form", "kongre-basvuru-formu.html");
  const html = fs.readFileSync(filePath, "utf8");

  const rewritten = html
    .replaceAll('src="img/', 'src="/sosyal-form/')
    .replaceAll('href="img/', 'href="/sosyal-form/');

  return new Response(rewritten, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
