import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/server/auth-guard";
import { createContactMessage, getContactSettings, updateContactSettings } from "@/lib/server/contact-storage";

export const dynamic = "force-dynamic";

function noStoreJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function GET() {
  const settings = await getContactSettings();
  return noStoreJson({ settings });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    contact?: string;
    message?: string;
  };

  const name = String(body.name ?? "").trim();
  const contact = String(body.contact ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !contact || !message) {
    return noStoreJson({ message: "请完整填写称呼、联系方式和留言内容" }, 400);
  }

  if (name.length > 80 || contact.length > 120 || message.length > 2000) {
    return noStoreJson({ message: "留言内容过长，请精简后重试" }, 400);
  }

  const record = await createContactMessage({ name, contact, message });
  return noStoreJson({ item: record }, 201);
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return noStoreJson({ message: "未授权访问" }, 401);
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    wechat?: string;
    phone?: string;
  };

  const email = String(body.email ?? "").trim();
  const wechat = String(body.wechat ?? "").trim();
  const phone = String(body.phone ?? "").trim();

  if (!email || !wechat || !phone) {
    return noStoreJson({ message: "邮箱、微信和电话不能为空" }, 400);
  }

  const settings = await updateContactSettings({ email, wechat, phone });
  return noStoreJson({ settings });
}
