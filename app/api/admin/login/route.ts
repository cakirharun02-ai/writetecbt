import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_USER,
  ADMIN_PASS,
  createSessionToken,
  verifySessionToken,
} from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEquals(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Giriş: kullanıcı adı/parola doğruysa httpOnly oturum cookie'si set edilir. */
export async function POST(request: Request) {
  let username = "";
  let password = "";
  try {
    const body = await request.json();
    username = String(body?.username || "").trim();
    password = String(body?.password || "");
  } catch {
    return Response.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  if (!safeEquals(username, ADMIN_USER) || !safeEquals(password, ADMIN_PASS)) {
    return Response.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  return Response.json({ ok: true });
}

/** Oturum kontrolü (sayfa yenilenince panelin girişte kalıp kalmayacağı). */
export async function GET() {
  const cookieStore = await cookies();
  const ok = verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  return Response.json({ ok }, { status: ok ? 200 : 401 });
}

/** Çıkış. */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return Response.json({ ok: true });
}
