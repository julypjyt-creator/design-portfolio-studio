import { Work } from "@/lib/types";
import { categories as seedCategories, tags as seedTags, works as seedWorks } from "@/data/works";
import { prisma } from "@/lib/server/prisma";

export type WorksScope = "all" | "public";

const dbEnabled = Boolean(process.env.DATABASE_URL);

const memoryWorks: Work[] = structuredClone(seedWorks);
const memoryTags = Array.from(new Set([...seedTags, ...seedWorks.flatMap((work) => work.tags)]));
const memoryCategories = Array.from(new Set([...seedCategories, ...seedWorks.map((work) => work.category)]));

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function parseDate(input?: string) {
  if (!input) return null;
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function ensureSlug(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-") || `work-${Date.now()}`
  );
}

function dedupeTags(input: string[]) {
  const output: string[] = [];
  const seen = new Set<string>();

  for (const raw of input) {
    const tag = raw.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(tag);
  }

  return output;
}

function normalizeName(value: string) {
  return value.trim();
}

function dedupeNames(input: string[]) {
  const output: string[] = [];
  const seen = new Set<string>();

  for (const raw of input) {
    const item = normalizeName(raw);
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }

  return output;
}

function toWorkEntity(row: {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  detailImages: unknown;
  category: string;
  projectType: string;
  summary: string;
  completedAt: Date | null;
  commercialIncluded: boolean;
  commercialUse: boolean;
  featured: boolean;
  isPublic: boolean;
  status: string;
  projectBackground: string | null;
  designDescription: string | null;
  software: unknown;
  deliverables: unknown;
  createdAt: Date;
  updatedAt: Date;
  tags: Array<{ tag: { name: string } }>;
}): Work {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    coverImage: row.coverImage,
    detailImages: normalizeStringArray(row.detailImages),
    category: row.category as Work["category"],
    tags: row.tags.map((item) => item.tag.name),
    projectType: row.projectType as Work["projectType"],
    summary: row.summary,
    completedAt: row.completedAt ? row.completedAt.toISOString().slice(0, 10) : "",
    commercialIncluded: row.commercialIncluded,
    commercialUse: row.commercialUse,
    featured: row.featured,
    isPublic: row.isPublic,
    status: row.status as Work["status"],
    projectBackground: row.projectBackground ?? undefined,
    designDescription: row.designDescription ?? undefined,
    software: normalizeStringArray(row.software),
    deliverables: normalizeStringArray(row.deliverables),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

function filterByScope(items: Work[], scope: WorksScope) {
  if (scope === "public") {
    return items.filter((item) => item.isPublic && item.status === "已发布");
  }
  return items;
}

function sortWorks(items: Work[]) {
  return [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function listWorksFromDb(scope: WorksScope) {
  const rows = await prisma.work.findMany({
    where: scope === "public" ? { isPublic: true, status: "已发布" } : undefined,
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  return rows.map(toWorkEntity);
}

function listWorksFromMemory(scope: WorksScope) {
  return sortWorks(filterByScope(memoryWorks, scope));
}

async function upsertTagsAndGetIds(tagNames: string[]) {
  const unique = dedupeTags(tagNames);
  const records = [] as Array<{ id: number }>;

  for (const name of unique) {
    const record = await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {}
    });
    records.push({ id: record.id });
  }

  return records;
}

export async function listWorks(scope: WorksScope = "all") {
  if (!dbEnabled) {
    return listWorksFromMemory(scope);
  }

  try {
    return await listWorksFromDb(scope);
  } catch {
    return listWorksFromMemory(scope);
  }
}

export async function getWorkById(id: string) {
  if (!dbEnabled) {
    return memoryWorks.find((item) => item.id === id);
  }

  try {
    const row = await prisma.work.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return row ? toWorkEntity(row) : undefined;
  } catch {
    return memoryWorks.find((item) => item.id === id);
  }
}

export async function createWork(payload: Work) {
  const data: Work = {
    ...payload,
    id: payload.id || `w-${Date.now()}`,
    slug: payload.slug || ensureSlug(payload.name),
    tags: dedupeTags(payload.tags)
  };

  if (!dbEnabled) {
    memoryWorks.unshift({ ...data, updatedAt: new Date().toISOString() });
    if (!memoryCategories.some((item) => item.toLowerCase() === data.category.toLowerCase())) {
      memoryCategories.push(data.category);
    }
    for (const tag of data.tags) {
      if (!memoryTags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
        memoryTags.push(tag);
      }
    }
    return data;
  }

  try {
    await prisma.category.upsert({
      where: { name: data.category },
      create: { name: data.category },
      update: {}
    });

    const tagRecords = await upsertTagsAndGetIds(data.tags);

    const created = await prisma.work.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        coverImage: data.coverImage,
        detailImages: data.detailImages,
        category: data.category,
        projectType: data.projectType,
        summary: data.summary,
        completedAt: parseDate(data.completedAt),
        commercialIncluded: data.commercialIncluded,
        commercialUse: data.commercialUse,
        featured: data.featured,
        isPublic: data.isPublic,
        status: data.status,
        projectBackground: data.projectBackground,
        designDescription: data.designDescription,
        software: data.software,
        deliverables: data.deliverables,
        createdAt: parseDate(data.createdAt) ?? new Date(),
        tags: {
          createMany: {
            data: tagRecords.map((tag) => ({ tagId: tag.id }))
          }
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return toWorkEntity(created);
  } catch {
    memoryWorks.unshift({ ...data, updatedAt: new Date().toISOString() });
    if (!memoryCategories.some((item) => item.toLowerCase() === data.category.toLowerCase())) {
      memoryCategories.push(data.category);
    }
    return data;
  }
}

export async function updateWork(id: string, payload: Work) {
  const data: Work = {
    ...payload,
    id,
    slug: payload.slug || ensureSlug(payload.name),
    tags: dedupeTags(payload.tags)
  };

  if (!dbEnabled) {
    const index = memoryWorks.findIndex((item) => item.id === id);
    if (index >= 0) {
      memoryWorks[index] = { ...data, updatedAt: new Date().toISOString() };
      if (!memoryCategories.some((item) => item.toLowerCase() === data.category.toLowerCase())) {
        memoryCategories.push(data.category);
      }
      for (const tag of data.tags) {
        if (!memoryTags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
          memoryTags.push(tag);
        }
      }
    }
    return memoryWorks[index];
  }

  try {
    await prisma.category.upsert({
      where: { name: data.category },
      create: { name: data.category },
      update: {}
    });

    const tagRecords = await upsertTagsAndGetIds(data.tags);

    await prisma.$transaction([
      prisma.workTag.deleteMany({ where: { workId: id } }),
      prisma.work.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          coverImage: data.coverImage,
          detailImages: data.detailImages,
          category: data.category,
          projectType: data.projectType,
          summary: data.summary,
          completedAt: parseDate(data.completedAt),
          commercialIncluded: data.commercialIncluded,
          commercialUse: data.commercialUse,
          featured: data.featured,
          isPublic: data.isPublic,
          status: data.status,
          projectBackground: data.projectBackground,
          designDescription: data.designDescription,
          software: data.software,
          deliverables: data.deliverables,
          createdAt: parseDate(data.createdAt) ?? new Date(data.createdAt),
          tags: {
            createMany: {
              data: tagRecords.map((tag) => ({ tagId: tag.id }))
            }
          }
        }
      })
    ]);

    const fresh = await prisma.work.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return fresh ? toWorkEntity(fresh) : undefined;
  } catch {
    const index = memoryWorks.findIndex((item) => item.id === id);
    if (index >= 0) {
      memoryWorks[index] = { ...data, updatedAt: new Date().toISOString() };
      if (!memoryCategories.some((item) => item.toLowerCase() === data.category.toLowerCase())) {
        memoryCategories.push(data.category);
      }
      for (const tag of data.tags) {
        if (!memoryTags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
          memoryTags.push(tag);
        }
      }
      return memoryWorks[index];
    }
    return undefined;
  }
}

export async function deleteWork(id: string) {
  if (!dbEnabled) {
    const index = memoryWorks.findIndex((item) => item.id === id);
    if (index >= 0) {
      memoryWorks.splice(index, 1);
      return true;
    }
    return false;
  }

  try {
    await prisma.work.delete({ where: { id } });
    return true;
  } catch {
    const index = memoryWorks.findIndex((item) => item.id === id);
    if (index >= 0) {
      memoryWorks.splice(index, 1);
      return true;
    }
    return false;
  }
}

export async function listTags() {
  if (!dbEnabled) {
    return [...memoryTags].sort((a, b) => a.localeCompare(b));
  }

  try {
    const rows = await prisma.tag.findMany({
      orderBy: { name: "asc" }
    });
    return rows.map((row) => row.name);
  } catch {
    return [...memoryTags].sort((a, b) => a.localeCompare(b));
  }
}

export async function addTag(name: string) {
  const normalized = name.trim();
  if (!normalized) return listTags();

  if (!dbEnabled) {
    if (!memoryTags.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      memoryTags.push(normalized);
    }
    return listTags();
  }

  try {
    await prisma.tag.upsert({
      where: { name: normalized },
      create: { name: normalized },
      update: {}
    });
    return listTags();
  } catch {
    if (!memoryTags.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      memoryTags.push(normalized);
    }
    return listTags();
  }
}

export async function removeTag(name: string) {
  const normalized = name.trim();
  if (!normalized) return listTags();

  if (!dbEnabled) {
    const index = memoryTags.findIndex((item) => item.toLowerCase() === normalized.toLowerCase());
    if (index >= 0) {
      memoryTags.splice(index, 1);
    }
    for (const work of memoryWorks) {
      work.tags = work.tags.filter((item) => item.toLowerCase() !== normalized.toLowerCase());
    }
    return listTags();
  }

  try {
    const target = await prisma.tag.findUnique({ where: { name: normalized } });
    if (target) {
      await prisma.$transaction([
        prisma.workTag.deleteMany({ where: { tagId: target.id } }),
        prisma.tag.delete({ where: { id: target.id } })
      ]);
    }
    return listTags();
  } catch {
    return listTags();
  }
}

export async function listCategories() {
  if (!dbEnabled) {
    return dedupeNames(memoryCategories);
  }

  try {
    const rows = await prisma.category.findMany({
      orderBy: { createdAt: "asc" }
    });

    if (rows.length > 0) {
      return dedupeNames(rows.map((row) => row.name));
    }

    const fromWorks = await prisma.work.findMany({
      select: { category: true },
      distinct: ["category"]
    });
    const seeds = dedupeNames([...seedCategories, ...fromWorks.map((row) => row.category)]);

    if (seeds.length > 0) {
      await prisma.category.createMany({
        data: seeds.map((name) => ({ name })),
        skipDuplicates: true
      });
    }

    return seeds;
  } catch {
    return dedupeNames(memoryCategories);
  }
}

export async function addCategory(name: string) {
  const normalized = normalizeName(name);
  if (!normalized) return listCategories();

  if (!dbEnabled) {
    if (!memoryCategories.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      memoryCategories.push(normalized);
    }
    return listCategories();
  }

  try {
    const existed = await prisma.category.findFirst({
      where: { name: normalized }
    });
    if (!existed) {
      await prisma.category.create({
        data: { name: normalized }
      });
    }
    return listCategories();
  } catch {
    if (!memoryCategories.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      memoryCategories.push(normalized);
    }
    return listCategories();
  }
}

export async function renameCategory(name: string, nextName: string) {
  const from = normalizeName(name);
  const to = normalizeName(nextName);

  if (!from || !to || from.toLowerCase() === to.toLowerCase()) {
    return listCategories();
  }

  if (!dbEnabled) {
    const current = memoryCategories.find((item) => item.toLowerCase() === from.toLowerCase());
    if (!current) return listCategories();

    const existed = memoryCategories.find((item) => item.toLowerCase() === to.toLowerCase());
    const target = existed ?? to;

    for (const work of memoryWorks) {
      if (work.category.toLowerCase() === current.toLowerCase()) {
        work.category = target;
      }
    }

    if (!existed) {
      memoryCategories.push(to);
    }
    const index = memoryCategories.findIndex((item) => item.toLowerCase() === current.toLowerCase());
    if (index >= 0) {
      memoryCategories.splice(index, 1);
    }

    return listCategories();
  }

  try {
    const current = await prisma.category.findFirst({
      where: { name: from }
    });
    const currentName = current?.name ?? from;

    let target = await prisma.category.findFirst({
      where: { name: to }
    });

    await prisma.$transaction(async (tx) => {
      if (!target) {
        target = await tx.category.create({
          data: { name: to }
        });
      }

      await tx.work.updateMany({
        where: { category: currentName },
        data: { category: target.name }
      });

      if (current && current.name.toLowerCase() !== target.name.toLowerCase()) {
        await tx.category.delete({
          where: { id: current.id }
        });
      }
    });

    return listCategories();
  } catch {
    return listCategories();
  }
}

export async function removeCategory(name: string) {
  const normalized = normalizeName(name);
  if (!normalized) return listCategories();

  if (!dbEnabled) {
    const current = memoryCategories.find((item) => item.toLowerCase() === normalized.toLowerCase());
    if (!current || memoryCategories.length <= 1) {
      return listCategories();
    }

    const fallback = memoryCategories.find((item) => item.toLowerCase() !== current.toLowerCase()) ?? "其他";

    for (const work of memoryWorks) {
      if (work.category.toLowerCase() === current.toLowerCase()) {
        work.category = fallback;
      }
    }

    const index = memoryCategories.findIndex((item) => item.toLowerCase() === current.toLowerCase());
    if (index >= 0) {
      memoryCategories.splice(index, 1);
    }

    return listCategories();
  }

  try {
    const categories = await listCategories();
    const current = categories.find((item) => item.toLowerCase() === normalized.toLowerCase());
    if (!current || categories.length <= 1) {
      return categories;
    }

    const fallback = categories.find((item) => item.toLowerCase() !== current.toLowerCase()) ?? "其他";
    const categoryRow = await prisma.category.findFirst({
      where: { name: current }
    });

    await prisma.$transaction(async (tx) => {
      const fallbackRow = await tx.category.findFirst({
        where: { name: fallback }
      });
      if (!fallbackRow) {
        await tx.category.create({
          data: { name: fallback }
        });
      }

      await tx.work.updateMany({
        where: { category: current },
        data: { category: fallback }
      });

      if (categoryRow && categoryRow.name.toLowerCase() !== fallback.toLowerCase()) {
        await tx.category.delete({
          where: { id: categoryRow.id }
        });
      }
    });

    return listCategories();
  } catch {
    return listCategories();
  }
}
