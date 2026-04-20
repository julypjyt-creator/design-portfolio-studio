const SESSION_COOKIE_NAME = "admin_session";
const LOGOUT_MARKER_COOKIE_NAME = "admin_logout_marker";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const LOGOUT_MARKER_TTL_SECONDS = 60 * 10;

function getAuthSecret() {
  return process.env.AUTH_SECRET || "dev-auth-secret-change-me";
}

export function getAdminUsername() {
  return process.env.ADMIN_USERNAME || "admin";
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123456";
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signPayload(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(signature);
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createSessionToken() {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const nonce = crypto.randomUUID();
  const payload = `${expiresAt}.${nonce}`;
  const signature = await signPayload(payload, getAuthSecret());
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [expiresText, nonce, providedSignature] = parts;
  const expiresAt = Number(expiresText);

  if (!Number.isFinite(expiresAt) || !nonce || !providedSignature) {
    return false;
  }

  if (Date.now() > expiresAt) {
    return false;
  }

  const expectedSignature = await signPayload(`${expiresText}.${nonce}`, getAuthSecret());
  return safeEqual(providedSignature, expectedSignature);
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionTTLSeconds() {
  return SESSION_TTL_SECONDS;
}

export function getLogoutMarkerCookieName() {
  return LOGOUT_MARKER_COOKIE_NAME;
}

export function getLogoutMarkerTTLSeconds() {
  return LOGOUT_MARKER_TTL_SECONDS;
}
