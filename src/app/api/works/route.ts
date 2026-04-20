import { NextRequest, NextResponse } from "next/server";
import { Work } from "@/lib/types";
import { isAdminAuthenticated } from "@/lib/server/auth-guard";
import { createWork, listWorks, WorksScope } from "@/lib/server/works-repository";

export const dynamic = "force-dynamic";

function noStoreJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function GET(request: NextRequest) {
  const scope = (request.nextUrl.searchParams.get("scope") || "public") as WorksScope;
  if (scope === "all" && !(await isAdminAuthenticated())) {
    return noStoreJson({ message: "未授权访问" }, 401);
  }
  const data = await listWorks(scope === "all" ? "all" : "public");
  return noStoreJson({ items: data });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return noStoreJson({ message: "未授权访问" }, 401);
  }

  const body = (await request.json().catch(() => null)) as Work | null;

  if (!body?.name?.trim()) {
    return noStoreJson({ message: "作品名称不能为空" }, 400);
  }

  const created = await createWork(body);
  return noStoreJson({ item: created }, 201);
}
