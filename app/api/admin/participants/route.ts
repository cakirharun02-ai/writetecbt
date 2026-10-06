import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  callAppsScript,
  congressExecUrl,
  verifySessionToken,
} from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Kongreye ait başvuruları Apps Script'ten çeker (action=adminList). */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const congress = String(request.nextUrl.searchParams.get("congress") || "").trim();
  const execUrl = congressExecUrl(congress);
  if (!execUrl) {
    return Response.json(
      { ok: false, error: `Bu kongre için Apps Script URL'si tanımlı değil: ${congress}` },
      { status: 400 }
    );
  }
  try {
    const result = await callAppsScript(execUrl, { action: "adminList" });
    return Response.json(result, { status: result.ok ? 200 : 502 });
  } catch (err) {
    return Response.json(
      { ok: false, error: `Apps Script'e ulaşılamadı: ${String(err)}` },
      { status: 502 }
    );
  }
}
