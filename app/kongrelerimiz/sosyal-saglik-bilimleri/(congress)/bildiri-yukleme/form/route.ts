import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Bildiri yükleme formu HTML'i (bildiri-form-sosyal/bildiri-yukleme-formu.html) birebir sunulur.
 * bildiri-form-sosyal, bildiri-form-saglik'ten AYRI bir kopyadır; saglik formu bu rotadan etkilenmez.
 * Yalnızca göreli `img/...` varlık yolları sunulan konuma (/bildiri-form-sosyal/...) yeniden yazılır.
 */
export function GET() {
  const filePath = path.join(process.cwd(), "bildiri-form-sosyal", "bildiri-yukleme-formu.html");
  const html = fs.readFileSync(filePath, "utf8");

  const rewritten = html
    .replaceAll('src="img/', 'src="/bildiri-form-sosyal/')
    .replaceAll('href="img/', 'href="/bildiri-form-sosyal/');

  return new Response(rewritten, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
