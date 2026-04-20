"use client";

import { tags as seedTags } from "@/data/works";

const TAGS_STORAGE_KEY = "studio_archive_tags_v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeTag(tag: string) {
  return tag.trim();
}

function dedupeTags(input: string[]) {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const raw of input) {
    const tag = normalizeTag(raw);
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(tag);
  }

  return result;
}

function notifyTagsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("tags-updated"));
}

export function loadTagsFromStorage() {
  if (!canUseStorage()) return dedupeTags(seedTags);

  const raw = window.localStorage.getItem(TAGS_STORAGE_KEY);
  if (!raw) return dedupeTags(seedTags);

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return dedupeTags(seedTags);
    return dedupeTags(parsed.filter((item) => typeof item === "string"));
  } catch {
    return dedupeTags(seedTags);
  }
}

export function saveTagsToStorage(tags: string[]) {
  const clean = dedupeTags(tags);
  if (canUseStorage()) {
    window.localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(clean));
    notifyTagsUpdated();
  }
  return clean;
}

export function addTagToStorage(tag: string) {
  const normalized = normalizeTag(tag);
  if (!normalized) return loadTagsFromStorage();

  const current = loadTagsFromStorage();
  const hasExisting = current.some((item) => item.toLowerCase() === normalized.toLowerCase());
  if (hasExisting) return current;

  return saveTagsToStorage([...current, normalized]);
}

export function removeTagFromStorage(tag: string) {
  const normalized = normalizeTag(tag).toLowerCase();
  const current = loadTagsFromStorage();
  return saveTagsToStorage(current.filter((item) => item.toLowerCase() !== normalized));
}
