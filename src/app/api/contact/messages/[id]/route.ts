import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/server/auth-guard";
import { deleteContactMessage, updateContactMessageStatus } from "@/lib/server/contact-storage";

export const dynamic = "force-dynamic";

function noStoreJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return noStoreJson({ message: "未授权访问" }, 401);
  }

  const body = (await request.json().catch(() => ({}))) as { status?: string };
  const status = body.status === "read" ? "read" : "new";
  const { id } = await context.params;
  const item = await updateContactMessageStatus(id, status);

  if (!item) {
    return noStoreJson({ message: "留言不存在" }, 404);
  }

  return noStoreJson({ item });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return noStoreJson({ message: "未授权访问" }, 401);
  }

  const { id } = await context.params;
  const success = await deleteContactMessage(id);

  if (!success) {
    return noStoreJson({ message: "留言不存在" }, 404);
  }

  return noStoreJson({ success: true });
}
