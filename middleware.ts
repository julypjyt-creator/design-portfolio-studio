import { NextRequest, NextResponse } from "next/server";
import { getLogoutMarkerCookieName, getSessionCookieName, verifySessionToken } from "@/lib/auth";

const LOGIN_PATH = "/admin/login";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getSessionCookieName())?.value;
  const hasLogoutMarker = Boolean(request.cookies.get(getLogoutMarkerCookieName())?.value);
  const isValid = await verifySessionToken(token);

  if (pathname === LOGIN_PATH) {
    if (hasLogoutMarker) {
      const response = NextResponse.next();
      response.cookies.delete(getSessionCookieName());
      return response;
    }
    return NextResponse.next();
  }

  if (!isValid || hasLogoutMarker) {
    const target = `${pathname}${search}`;
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", target);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(getSessionCookieName());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
