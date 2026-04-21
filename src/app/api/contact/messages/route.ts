import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/server/auth-guard";
import { listContactMessages } from "@/lib/server/contact-storage";

export const dynamic = "force-dynamic";

function noStoreJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return noStoreJson({ message: "未授权访问" }, 401);
  }

  const items = await listContactMessages();
  const unreadCount = items.filter((item) => item.status === "new").length;
  return noStoreJson({ items, unreadCount });
}
