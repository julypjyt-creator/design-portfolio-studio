import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getLogoutMarkerCookieName, getSessionCookieName, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const hasLogoutMarker = Boolean(cookieStore.get(getLogoutMarkerCookieName())?.value);
  const valid = await verifySessionToken(token);

  const response = NextResponse.json(
    {
      authenticated: valid && !hasLogoutMarker
    },
    { status: 200 }
  );

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}
