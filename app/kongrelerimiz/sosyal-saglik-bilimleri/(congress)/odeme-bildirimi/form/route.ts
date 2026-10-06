import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ödeme bildirim formu HTML'i (odeme-form-sosyal/odeme-bildirimi-formu.html) birebir sunulur.
 * Form sabit kaynaklara (/img/..., /bildiri-form-sosyal/uk.svg, /turkey.svg) mutlak yol
 * kullandığı için ek asset yeniden yazımı gerekmez.
 */
export function GET() {
  const filePath = path.join(process.cwd(), "odeme-form-sosyal", "odeme-bildirimi-formu.html");
  const html = fs.readFileSync(filePath, "utf8");

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
