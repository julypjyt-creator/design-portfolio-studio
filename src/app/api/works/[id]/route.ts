import { NextRequest, NextResponse } from "next/server";
import { Work } from "@/lib/types";
import { isAdminAuthenticated } from "@/lib/server/auth-guard";
import { deleteWork, getWorkById, updateWork } from "@/lib/server/works-repository";

export const dynamic = "force-dynamic";

function noStoreJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return noStoreJson({ message: "未授权访问" }, 401);
  }

  const { id } = await context.params;
  const item = await getWorkById(id);

  if (!item) {
    return noStoreJson({ message: "作品不存在" }, 404);
  }

  return noStoreJson({ item });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return noStoreJson({ message: "未授权访问" }, 401);
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as Work | null;

  if (!body?.name?.trim()) {
    return noStoreJson({ message: "作品名称不能为空" }, 400);
  }

  const updated = await updateWork(id, body);

  if (!updated) {
    return noStoreJson({ message: "作品不存在" }, 404);
  }

  return noStoreJson({ item: updated });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return noStoreJson({ message: "未授权访问" }, 401);
  }

  const { id } = await context.params;
  const success = await deleteWork(id);

  if (!success) {
    return noStoreJson({ message: "作品不存在" }, 404);
  }

  return noStoreJson({ success: true });
}
