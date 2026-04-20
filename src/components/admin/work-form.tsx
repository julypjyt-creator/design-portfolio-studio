"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { categories } from "@/data/works";
import { ProjectType, Work, WorkStatus } from "@/lib/types";

const projectTypes: ProjectType[] = ["住宅", "商业空间", "公共空间", "文旅景观", "概念提案"];
const statuses: WorkStatus[] = ["草稿", "已发布", "已归档"];

const fallbackCover =
  "https://images.unsplash.com/photo-1616594039964-3d5d6be4f2f1?auto=format&fit=crop&w=1600&q=80";

function compressImageToDataURL(file: File, maxWidth = 1400, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("图片压缩失败"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = String(reader.result ?? "");
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
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

async function fetchTagsFromApi() {
  const response = await fetch("/api/tags", {
    cache: "no-store"
  });
  const data = (await response.json().catch(() => ({}))) as { items?: string[] };
  return Array.isArray(data.items) ? data.items : [];
}

export function WorkForm({ initialWork }: { initialWork?: Work }) {
  const isEditMode = Boolean(initialWork);
  const router = useRouter();

  const [name, setName] = useState(initialWork?.name ?? "");
  const [projectType, setProjectType] = useState<ProjectType>(initialWork?.projectType ?? "住宅");
  const [category, setCategory] = useState(initialWork?.category ?? categories[0]);
  const [completedAt, setCompletedAt] = useState(initialWork?.completedAt ?? "");
  const [summary, setSummary] = useState(initialWork?.summary ?? "");
  const [status, setStatus] = useState<WorkStatus>(initialWork?.status ?? "已发布");

  const [selectedTags, setSelectedTags] = useState<string[]>(() => dedupeTags(initialWork?.tags ?? []));
  const [tagInput, setTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const [coverPreview, setCoverPreview] = useState<string | null>(initialWork?.coverImage ?? null);
  const [galleryPreview, setGalleryPreview] = useState<string[]>(initialWork?.detailImages ?? []);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [commercialIncluded, setCommercialIncluded] = useState(initialWork?.commercialIncluded ?? false);
  const [isPublic, setIsPublic] = useState(initialWork?.isPublic ?? true);
  const [featured, setFeatured] = useState(initialWork?.featured ?? false);

  const [submitted, setSubmitted] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const syncTags = () => {
      void fetchTagsFromApi()
        .then((items) => setAvailableTags(items))
        .catch(() => {
          // Keep existing list on request failures.
        });
    };
    syncTags();

    window.addEventListener("tags-updated", syncTags);

    return () => {
      window.removeEventListener("tags-updated", syncTags);
    };
  }, []);

  const progressText = useMemo(() => {
    if (!uploadProgress) return "未上传";
    if (uploadProgress >= 100) return "上传完成";
    return `上传中 ${uploadProgress}%`;
  }, [uploadProgress]);

  const normalizedTagInput = tagInput.trim();

  const matchedExistingTag = useMemo(
    () => availableTags.find((item) => item.toLowerCase() === normalizedTagInput.toLowerCase()),
    [availableTags, normalizedTagInput]
  );

  const tagSuggestions = useMemo(() => {
    if (!normalizedTagInput) return [];

    return availableTags
      .filter((tag) => tag.toLowerCase().includes(normalizedTagInput.toLowerCase()))
      .filter((tag) => !selectedTags.some((item) => item.toLowerCase() === tag.toLowerCase()))
      .slice(0, 8);
  }, [availableTags, normalizedTagInput, selectedTags]);

  const canCreateTag =
    normalizedTagInput.length > 0 &&
    !availableTags.some((item) => item.toLowerCase() === normalizedTagInput.toLowerCase()) &&
    !selectedTags.some((item) => item.toLowerCase() === normalizedTagInput.toLowerCase());

  const simulateUpload = () => {
    setUploadProgress(20);
    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const addTagToSelection = async (tag: string, createIfMissing = false) => {
    const normalized = tag.trim();
    if (!normalized) return;

    if (createIfMissing) {
      try {
        const response = await fetch("/api/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: normalized })
        });
        if (response.ok) {
          const data = (await response.json().catch(() => ({}))) as { items?: string[] };
          if (Array.isArray(data.items)) {
            setAvailableTags(data.items);
          }
          window.dispatchEvent(new Event("tags-updated"));
        }
      } catch {
        // Keep going with local selected tags to avoid interrupting form input.
      }
    }

    setSelectedTags((prev) => {
      if (prev.some((item) => item.toLowerCase() === normalized.toLowerCase())) return prev;
      return [...prev, normalized];
    });
    setTagInput("");
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (!normalizedTagInput) return;

      if (matchedExistingTag) {
        void addTagToSelection(matchedExistingTag);
        return;
      }

      void addTagToSelection(normalizedTagInput, true);
      return;
    }

    if (event.key === "Backspace" && !tagInput && selectedTags.length) {
      setSelectedTags((prev) => prev.slice(0, -1));
    }
  };

  const removeSelectedTag = (target: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== target));
  };

  const handleCover = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await compressImageToDataURL(file);
    setCoverPreview(url);
    simulateUpload();
  };

  const handleGallery = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const urls = await Promise.all(files.map((file) => compressImageToDataURL(file, 1600, 0.75)));
    setGalleryPreview((prev) => [...prev, ...urls]);
    simulateUpload();
  };

  const removeCover = () => {
    setCoverPreview(null);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryPreview((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetForm = () => {
    setName("");
    setProjectType("住宅");
    setCategory(categories[0]);
    setCompletedAt("");
    setSummary("");
    setStatus("已发布");
    setSelectedTags([]);
    setTagInput("");
    setCoverPreview(null);
    setGalleryPreview([]);
    setUploadProgress(0);
    setCommercialIncluded(false);
    setIsPublic(true);
    setFeatured(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorText("");
    setSubmitted(false);

    if (!name.trim()) {
      setErrorText("请填写作品名称");
      return;
    }

    const nowIso = new Date().toISOString();
    const dateText = completedAt || nowIso.slice(0, 10);
    const uniqueTags = dedupeTags(selectedTags).slice(0, 8);

    const base: Work = {
      id: initialWork?.id ?? `w-${Date.now()}`,
      name: name.trim(),
      slug: initialWork?.slug ?? `${slugify(name)}-${Date.now().toString().slice(-4)}`,
      coverImage: coverPreview ?? fallbackCover,
      detailImages: galleryPreview,
      category,
      tags: uniqueTags.length ? uniqueTags : ["现代"],
      projectType,
      summary: summary.trim() || "暂无项目简介",
      completedAt: dateText,
      commercialIncluded,
      commercialUse: commercialIncluded,
      featured,
      isPublic,
      status,
      createdAt: initialWork?.createdAt ?? nowIso,
      updatedAt: nowIso
    };

    setIsSaving(true);

    const endpoint = isEditMode ? `/api/works/${base.id}` : "/api/works";
    const method = isEditMode ? "PUT" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(base)
    }).catch(() => null);

    setIsSaving(false);

    if (!response?.ok) {
      setErrorText("保存失败，请稍后重试。");
      return;
    }

    setSubmitted(true);
    window.dispatchEvent(new Event("works-updated"));

    if (isEditMode) {
      setTimeout(() => router.push("/admin/works"), 500);
      return;
    }

    resetForm();
  };

  return (
    <form onSubmit={handleSubmit} className="panel space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-stone">
          作品名称
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 w-full rounded-lg border border-line px-4 text-sm"
            placeholder="输入作品名称"
          />
        </label>
        <label className="space-y-2 text-sm text-stone">
          项目类型
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value as ProjectType)}
            className="h-11 w-full rounded-lg border border-line px-4 text-sm"
          >
            {projectTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-stone">
          作品分类
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as (typeof categories)[number])}
            className="h-11 w-full rounded-lg border border-line px-4 text-sm"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-stone">
          完成日期
          <input
            type="date"
            value={completedAt}
            onChange={(e) => setCompletedAt(e.target.value)}
            className="h-11 w-full rounded-lg border border-line px-4 text-sm"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm text-stone">
        项目简介
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="min-h-24 w-full rounded-lg border border-line px-4 py-3 text-sm"
          placeholder="简述项目背景与核心亮点"
        />
      </label>

      <div className="space-y-2 text-sm text-stone">
        <p>标签</p>
        <div className="flex min-h-11 flex-wrap gap-2 rounded-lg border border-line px-3 py-2">
          {selectedTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-xs text-ink">
              {tag}
              <button type="button" className="text-red-500" onClick={() => removeSelectedTag(tag)}>
                删除
              </button>
            </span>
          ))}
          {!selectedTags.length ? <span className="py-1 text-xs text-stone">暂未选择标签</span> : null}
        </div>
        <div className="relative">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="h-11 w-full rounded-lg border border-line px-4 text-sm"
            placeholder="输入标签关键词，按回车选择已有或新建"
          />
          {tagSuggestions.length || canCreateTag ? (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-line bg-white shadow-card">
              {tagSuggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => void addTagToSelection(tag)}
                  className="block w-full border-b border-line px-4 py-2 text-left text-sm text-ink last:border-b-0 hover:bg-panel"
                >
                  使用已有标签：{tag}
                </button>
              ))}
              {canCreateTag ? (
                <button
                  type="button"
                  onClick={() => void addTagToSelection(normalizedTagInput, true)}
                  className="block w-full px-4 py-2 text-left text-sm text-accent hover:bg-panel"
                >
                  新建标签：{normalizedTagInput}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        <p className="text-xs text-stone">提示：标签来自“标签管理”；可输入关键词联想，若不存在可直接新建。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-stone">
          上传封面图
          <input type="file" accept="image/*" onChange={handleCover} className="block w-full text-sm" />
          {coverPreview ? (
            <div className="relative mt-2 aspect-[4/3] overflow-hidden rounded-lg border border-line">
              <Image src={coverPreview} alt="封面预览" fill className="object-cover" />
              <button
                type="button"
                onClick={removeCover}
                className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs text-red-600 shadow"
              >
                删除
              </button>
            </div>
          ) : null}
        </label>

        <label className="space-y-2 text-sm text-stone">
          上传详情图（多张，支持追加）
          <input type="file" accept="image/*" multiple onChange={handleGallery} className="block w-full text-sm" />
          <div className="mt-2 grid grid-cols-3 gap-2">
            {galleryPreview.map((image, index) => (
              <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-line">
                <Image src={image} alt="详情图预览" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute right-1.5 top-1.5 rounded-md bg-white/90 px-2 py-0.5 text-xs text-red-600 shadow"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex items-center gap-2 rounded-lg border border-line p-3 text-sm text-stone">
          <input type="checkbox" checked={commercialIncluded} onChange={(e) => setCommercialIncluded(e.target.checked)} /> 商业收录
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-line p-3 text-sm text-stone">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> 公开展示
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-line p-3 text-sm text-stone">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> 推荐作品
        </label>
      </div>

      <label className="space-y-2 text-sm text-stone">
        项目状态
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as WorkStatus)}
          className="h-11 w-full rounded-lg border border-line px-4 text-sm"
        >
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${uploadProgress}%` }} />
        </div>
        <p className="text-xs text-stone">{progressText}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={isSaving} className="h-11 rounded-lg bg-ink px-6 text-sm font-medium text-white disabled:opacity-60">
          {isSaving ? "保存中..." : isEditMode ? "保存修改" : "保存作品"}
        </button>
      </div>

      {errorText ? <p className="text-sm text-red-600">{errorText}</p> : null}
      {submitted ? (
        <p className="text-sm text-accent">
          {isEditMode ? (
            <>修改已保存，正在返回 <Link href="/admin/works" className="underline">作品管理</Link>。</>
          ) : (
            <>已成功保存。去 <Link href="/admin/works" className="underline">作品管理</Link> 查看。</>
          )}
        </p>
      ) : null}
      <p className="text-xs text-stone">提示：当前作品会通过接口保存；若配置了 MySQL，会自动写入数据库。</p>
    </form>
  );
}
