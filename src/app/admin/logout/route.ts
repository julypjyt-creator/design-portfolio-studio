import { NextResponse } from "next/server";
import { getLogoutMarkerCookieName, getLogoutMarkerTTLSeconds, getSessionCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));

  response.cookies.delete(getSessionCookieName());
  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  response.cookies.set({
    name: getLogoutMarkerCookieName(),
    value: "1",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getLogoutMarkerTTLSeconds()
  });

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}
