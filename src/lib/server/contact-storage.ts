import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export type ContactMessageStatus = "new" | "read";

export interface ContactSettings {
  email: string;
  wechat: string;
  phone: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  contact: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
}

interface ContactStore {
  settings: ContactSettings;
  messages: ContactMessage[];
}

const storeDir = path.join(process.cwd(), "runtime-data");
const storeFile = path.join(storeDir, "contact-store.json");

function nowIso() {
  return new Date().toISOString();
}

function defaultStore(): ContactStore {
  return {
    settings: {
      email: "studio@example.com",
      wechat: "studio-archive",
      phone: "+86 138 0000 0000",
      updatedAt: nowIso()
    },
    messages: []
  };
}

function normalizeStore(input: unknown): ContactStore {
  const fallback = defaultStore();
  if (!input || typeof input !== "object") return fallback;

  const raw = input as Partial<ContactStore>;
  const rawSettings = (raw.settings ?? {}) as Partial<ContactSettings>;
  const settings: ContactSettings = {
    email: typeof rawSettings.email === "string" ? rawSettings.email : fallback.settings.email,
    wechat: typeof rawSettings.wechat === "string" ? rawSettings.wechat : fallback.settings.wechat,
    phone: typeof rawSettings.phone === "string" ? rawSettings.phone : fallback.settings.phone,
    updatedAt: typeof rawSettings.updatedAt === "string" ? rawSettings.updatedAt : fallback.settings.updatedAt
  };

  const messages = Array.isArray(raw.messages)
    ? raw.messages
        .filter((item): item is ContactMessage => {
          if (!item || typeof item !== "object") return false;
          const record = item as Partial<ContactMessage>;
          return (
            typeof record.id === "string" &&
            typeof record.name === "string" &&
            typeof record.contact === "string" &&
            typeof record.message === "string" &&
            typeof record.createdAt === "string" &&
            (record.status === "new" || record.status === "read")
          );
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  return { settings, messages };
}

async function ensureStoreFile() {
  await mkdir(storeDir, { recursive: true });

  try {
    await readFile(storeFile, "utf-8");
  } catch {
    await writeFile(storeFile, JSON.stringify(defaultStore(), null, 2), "utf-8");
  }
}

async function readStore() {
  await ensureStoreFile();
  const raw = await readFile(storeFile, "utf-8");

  try {
    return normalizeStore(JSON.parse(raw));
  } catch {
    const fallback = defaultStore();
    await writeStore(fallback);
    return fallback;
  }
}

async function writeStore(store: ContactStore) {
  await mkdir(storeDir, { recursive: true });
  await writeFile(storeFile, JSON.stringify(store, null, 2), "utf-8");
}

function cleanText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function getContactSettings() {
  const store = await readStore();
  return store.settings;
}

export async function updateContactSettings(input: Pick<ContactSettings, "email" | "wechat" | "phone">) {
  const store = await readStore();
  store.settings = {
    email: cleanText(input.email),
    wechat: cleanText(input.wechat),
    phone: cleanText(input.phone),
    updatedAt: nowIso()
  };
  await writeStore(store);
  return store.settings;
}

export async function listContactMessages() {
  const store = await readStore();
  return store.messages;
}

export async function createContactMessage(input: { name: string; contact: string; message: string }) {
  const store = await readStore();
  const record: ContactMessage = {
    id: `msg-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    name: cleanText(input.name),
    contact: cleanText(input.contact),
    message: input.message.trim(),
    status: "new",
    createdAt: nowIso()
  };
  store.messages.unshift(record);
  await writeStore(store);
  return record;
}

export async function updateContactMessageStatus(id: string, status: ContactMessageStatus) {
  const store = await readStore();
  const index = store.messages.findIndex((item) => item.id === id);
  if (index < 0) return null;
  store.messages[index] = { ...store.messages[index], status };
  await writeStore(store);
  return store.messages[index];
}

export async function deleteContactMessage(id: string) {
  const store = await readStore();
  const index = store.messages.findIndex((item) => item.id === id);
  if (index < 0) return false;
  store.messages.splice(index, 1);
  await writeStore(store);
  return true;
}
