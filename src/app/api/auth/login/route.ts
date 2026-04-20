import { NextResponse } from "next/server";
import {
  createSessionToken,
  getAdminPassword,
  getLogoutMarkerCookieName,
  getAdminUsername,
  getSessionCookieName,
  getSessionTTLSeconds
} from "@/lib/auth";

interface LoginPayload {
  username?: string;
  password?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginPayload;
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  if (username !== getAdminUsername() || password !== getAdminPassword()) {
    return NextResponse.json({ success: false, message: "账号或密码错误" }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: getSessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionTTLSeconds()
  });
  response.cookies.delete(getLogoutMarkerCookieName());

  return response;
}
