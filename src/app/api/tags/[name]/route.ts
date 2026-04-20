import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/server/auth-guard";
import { removeTag } from "@/lib/server/works-repository";

export const dynamic = "force-dynamic";

function noStoreJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function DELETE(_request: Request, context: { params: Promise<{ name: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return noStoreJson({ message: "未授权访问" }, 401);
  }

  const { name } = await context.params;
  const items = await removeTag(decodeURIComponent(name));
  return noStoreJson({ items });
}
