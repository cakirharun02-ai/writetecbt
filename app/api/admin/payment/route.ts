import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  callAppsScript,
  congressExecUrl,
  verifySessionToken,
} from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type PaymentBody = {
  congress?: string;
  ref?: string;
  karar?: "onay" | "ret";
  not?: string;
};

/**
 * Dekont onay/ret kararını Apps Script'e iletir.
 * Onay → ödeme "Ödendi" işlenir, katılımcıya kayıt kesinleşti maili gider.
 * Ret  → ödeme "Reddedildi" işlenir, katılımcıya tekrar yükleme maili gider.
 * Eşleştirme yalnızca ref üzerinden yapılır; dekont içeriği burada okunmaz/parse edilmez.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: PaymentBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const congress = String(body.congress || "").trim();
  const ref = String(body.ref || "").trim();
  const karar = body.karar;
  const not = String(body.not || "").trim();

  if (!ref || (karar !== "onay" && karar !== "ret")) {
    return Response.json({ ok: false, error: "ref ve karar (onay|ret) zorunlu." }, { status: 400 });
  }

  const execUrl = congressExecUrl(congress);
  if (!execUrl) {
    return Response.json(
      { ok: false, error: `Bu kongre için Apps Script URL'si tanımlı değil: ${congress}` },
      { status: 400 }
    );
  }
  try {
    const result =
      karar === "onay"
        ? await callAppsScript(execUrl, { action: "adminPaymentApprove", ref })
        : await callAppsScript(execUrl, { action: "adminPaymentReject", ref, not });
    return Response.json(result, { status: result.ok ? 200 : 502 });
  } catch (err) {
    return Response.json(
      { ok: false, error: `Apps Script'e ulaşılamadı: ${String(err)}` },
      { status: 502 }
    );
  }
}
