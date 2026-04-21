import OSS from "ali-oss";

type OssRuntimeConfig = {
  enabled: boolean;
  region: string;
  bucket: string;
  endpoint?: string;
  publicBaseUrl?: string;
  prefix: string;
  accessKeyId?: string;
  accessKeySecret?: string;
};

function trim(value?: string) {
  return value?.trim();
}

function withoutTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeEndpoint(endpoint: string) {
  return endpoint.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function normalizePublicBaseUrl(value?: string) {
  if (!value) return undefined;
  const candidate = withoutTrailingSlash(value);

  try {
    const parsed = new URL(candidate);
    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
    const hasAuth = Boolean(parsed.username || parsed.password);
    const hasInvalidHost = parsed.hostname.includes("..") || parsed.hostname.endsWith(".com.com");

    if (!isHttp || hasAuth || hasInvalidHost) {
      return undefined;
    }

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

function normalizePathname(pathname: string) {
  return pathname.replace(/^\/+/, "");
}

export function getOssConfig(): OssRuntimeConfig {
  const region = trim(process.env.OSS_REGION) ?? "";
  const bucket = trim(process.env.OSS_BUCKET) ?? "";
  const endpoint = trim(process.env.OSS_ENDPOINT);
  const publicBaseUrl = normalizePublicBaseUrl(trim(process.env.OSS_PUBLIC_BASE_URL));
  const prefix = trim(process.env.OSS_UPLOAD_PREFIX) || "portfolio-assets";
  const accessKeyId = trim(process.env.OSS_ACCESS_KEY_ID);
  const accessKeySecret = trim(process.env.OSS_ACCESS_KEY_SECRET);

  const enabled = Boolean(region && bucket && accessKeyId && accessKeySecret);

  return {
    enabled,
    region,
    bucket,
    endpoint,
    publicBaseUrl,
    prefix,
    accessKeyId,
    accessKeySecret
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __studioOssClient: OSS | undefined;
}

export function getOssClient() {
  const config = getOssConfig();

  if (!config.enabled || !config.accessKeyId || !config.accessKeySecret) {
    throw new Error("OSS environment variables are not configured.");
  }

  if (global.__studioOssClient) {
    return global.__studioOssClient;
  }

  const client = new OSS({
    region: config.region,
    bucket: config.bucket,
    endpoint: config.endpoint,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    secure: true,
    timeout: "60s"
  });

  if (process.env.NODE_ENV !== "production") {
    global.__studioOssClient = client;
  }

  return client;
}

export function buildPublicOssUrl(objectKey: string, uploadedUrl?: string) {
  const config = getOssConfig();

  if (config.publicBaseUrl) {
    return `${withoutTrailingSlash(config.publicBaseUrl)}/${objectKey}`;
  }

  if (uploadedUrl) {
    return uploadedUrl.replace(/^http:\/\//, "https://");
  }

  if (config.endpoint) {
    return `https://${config.bucket}.${normalizeEndpoint(config.endpoint)}/${objectKey}`;
  }

  return `https://${config.bucket}.${config.region}.aliyuncs.com/${objectKey}`;
}

export function extractObjectKeyFromUrl(input: string) {
  const value = input.trim();
  if (!value) return "";

  if (!/^https?:\/\//i.test(value)) {
    return normalizePathname(value);
  }

  const config = getOssConfig();
  try {
    const url = new URL(value);

    if (config.publicBaseUrl) {
      const base = new URL(withoutTrailingSlash(config.publicBaseUrl) + "/");
      if (url.origin === base.origin && url.pathname.startsWith(base.pathname)) {
        return normalizePathname(url.pathname.slice(base.pathname.length));
      }
    }

    return normalizePathname(url.pathname);
  } catch {
    return "";
  }
}
