import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/server/auth-guard";
import { addTag, listTags } from "@/lib/server/works-repository";

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

  const items = await listTags();
  return noStoreJson({ items });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return noStoreJson({ message: "未授权访问" }, 401);
  }

  const body = (await request.json().catch(() => ({}))) as { name?: string };
  const name = String(body.name ?? "").trim();

  if (!name) {
    return noStoreJson({ message: "标签名称不能为空" }, 400);
  }

  const items = await addTag(name);
  return noStoreJson({ items }, 201);
}
