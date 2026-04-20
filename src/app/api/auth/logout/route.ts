import { NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    maxAge: 0,
    path: "/"
  });

  return response;
}
