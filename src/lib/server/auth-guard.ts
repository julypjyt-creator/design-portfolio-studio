import { cookies } from "next/headers";
import { getLogoutMarkerCookieName, getSessionCookieName, verifySessionToken } from "@/lib/auth";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const hasLogoutMarker = Boolean(cookieStore.get(getLogoutMarkerCookieName())?.value);

  if (hasLogoutMarker) {
    return false;
  }

  return verifySessionToken(token);
}
