"use client";

import { works as seedWorks } from "@/data/works";
import { Work } from "@/lib/types";

const STORAGE_KEY = "studio_archive_works_v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyWorksUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("works-updated"));
}

export function loadWorksFromStorage(): Work[] {
  if (!canUseStorage()) return seedWorks;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedWorks;

  try {
    const parsed = JSON.parse(raw) as Work[];
    return Array.isArray(parsed) ? parsed : seedWorks;
  } catch {
    return seedWorks;
  }
}

export function saveWorksToStorage(items: Work[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Fallback: strip base64 image payloads to avoid browser storage quota errors.
    const compact = items.map(compactWorkForStorage);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
    } catch {
      // If storage is still full, keep the app responsive instead of throwing.
    }
  }
  notifyWorksUpdated();
}

export function addWorkToStorage(work: Work): Work[] {
  const current = loadWorksFromStorage();
  const next = [compactWorkForStorage(work), ...current.filter((item) => item.id !== work.id)];
  saveWorksToStorage(next);
  return next;
}

export function removeWorkFromStorage(id: string): Work[] {
  const current = loadWorksFromStorage();
  const next = current.filter((item) => item.id !== id);
  saveWorksToStorage(next);
  return next;
}

export function getWorkByIdFromStorage(id: string): Work | undefined {
  return loadWorksFromStorage().find((item) => item.id === id);
}

export function updateWorkInStorage(work: Work): Work[] {
  const current = loadWorksFromStorage();
  const next = current.map((item) => (item.id === work.id ? compactWorkForStorage(work) : item));
  saveWorksToStorage(next);
  return next;
}

function isBase64Image(input: string) {
  return input.startsWith("data:image/");
}

function compactWorkForStorage(work: Work): Work {
  return {
    ...work,
    // Keep cover image (including compressed base64) so user-selected cover remains visible.
    coverImage: work.coverImage,
    detailImages: work.detailImages.filter((item) => !isBase64Image(item)).slice(0, 8)
  };
}
