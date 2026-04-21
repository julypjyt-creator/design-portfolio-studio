import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/server/auth-guard";
import { buildPublicOssUrl, extractObjectKeyFromUrl, getOssClient, getOssConfig } from "@/lib/server/oss";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 12 * 1024 * 1024;

function noStoreJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

function formatDatePath() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function safeExtension(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  return ext.replace(/[^a-z0-9.]/g, "").slice(0, 10);
}

function keyInManagedPrefix(key: string, prefix: string) {
  return key === prefix || key.startsWith(`${prefix}/`);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return noStoreJson({ message: "未授权访问" }, 401);
  }

  const config = getOssConfig();
  if (!config.enabled) {
    return noStoreJson(
      {
        message: "OSS 未配置。请先在环境变量中设置 OSS_REGION、OSS_BUCKET、OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET。"
      },
      503
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return noStoreJson({ message: "未接收到上传文件" }, 400);
  }

  if (!file.type.startsWith("image/")) {
    return noStoreJson({ message: "仅支持图片文件" }, 400);
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return noStoreJson({ message: "图片大小不能超过 12MB" }, 400);
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = safeExtension(file.name) || ".jpg";
    const objectKey = `${config.prefix}/${formatDatePath()}/${randomUUID()}${extension}`;

    const client = getOssClient();
    const result = await client.put(objectKey, buffer, {
      mime: file.type
    });

    return noStoreJson({
      key: objectKey,
      url: buildPublicOssUrl(objectKey, result.url)
    });
  } catch {
    return noStoreJson({ message: "上传失败，请检查 OSS 配置或稍后重试" }, 500);
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return noStoreJson({ message: "未授权访问" }, 401);
  }

  const config = getOssConfig();
  if (!config.enabled) {
    return noStoreJson({ message: "OSS 未配置" }, 503);
  }

  const body = (await request.json().catch(() => ({}))) as { key?: string; url?: string };
  const objectKey = extractObjectKeyFromUrl(String(body.key || body.url || ""));

  if (!objectKey) {
    return noStoreJson({ message: "缺少图片地址或对象键" }, 400);
  }

  if (!keyInManagedPrefix(objectKey, config.prefix)) {
    return noStoreJson({ message: "仅允许删除当前项目上传目录中的图片" }, 400);
  }

  try {
    const client = getOssClient();
    await client.delete(objectKey);
    return noStoreJson({ success: true });
  } catch {
    return noStoreJson({ message: "删除失败，请稍后重试" }, 500);
  }
}
