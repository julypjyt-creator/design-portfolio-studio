"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

async function fetchTags() {
  const response = await fetch("/api/tags", { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as { items?: string[] };
  return Array.isArray(data.items) ? data.items : [];
}

export default function TagsPage() {
  const [newTag, setNewTag] = useState("");
  const [tagList, setTagList] = useState<string[]>([]);
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const sync = () => {
      void fetchTags()
        .then((items) => setTagList(items))
        .catch(() => {
          // Keep previous list if request fails.
        });
    };

    sync();
    window.addEventListener("tags-updated", sync);

    return () => {
      window.removeEventListener("tags-updated", sync);
    };
  }, []);

  const countText = useMemo(() => `共 ${tagList.length} 个标签`, [tagList.length]);

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    setErrorText("");

    const normalized = newTag.trim();
    if (!normalized) {
      setErrorText("请输入标签名称");
      return;
    }

    if (tagList.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      setErrorText("该标签已存在");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: normalized })
    }).catch(() => null);
    setIsSubmitting(false);

    if (!response?.ok) {
      setErrorText("新增失败，请稍后重试");
      return;
    }

    const data = (await response.json().catch(() => ({}))) as { items?: string[] };
    if (Array.isArray(data.items)) {
      setTagList(data.items);
    }
    setNewTag("");
    window.dispatchEvent(new Event("tags-updated"));
  };

  const handleDelete = async (tag: string) => {
    setErrorText("");

    const response = await fetch(`/api/tags/${encodeURIComponent(tag)}`, {
      method: "DELETE"
    }).catch(() => null);

    if (!response?.ok) {
      setErrorText("删除失败，请稍后重试");
      return;
    }

    const data = (await response.json().catch(() => ({}))) as { items?: string[] };
    if (Array.isArray(data.items)) {
      setTagList(data.items);
    }

    window.dispatchEvent(new Event("tags-updated"));
    window.dispatchEvent(new Event("works-updated"));
  };

  return (
    <AdminShell title="标签管理" description="统一维护作品标签，方便筛选和统计分析。">
      <section className="panel p-6">
        <form className="mb-2 flex gap-3" onSubmit={(event) => void handleAdd(event)}>
          <input
            placeholder="新增标签"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="h-11 flex-1 rounded-lg border border-line px-4 text-sm"
          />
          <button type="submit" disabled={isSubmitting} className="h-11 rounded-lg bg-ink px-5 text-sm font-medium text-white disabled:opacity-60">
            {isSubmitting ? "新增中..." : "新增标签"}
          </button>
        </form>

        <p className="mb-4 text-xs text-stone">{countText}</p>
        {errorText ? <p className="mb-4 text-sm text-red-600">{errorText}</p> : null}

        <div className="flex flex-wrap gap-2">
          {tagList.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-stone">
              {tag}
              <button type="button" className="text-xs text-red-500" onClick={() => void handleDelete(tag)}>
                删除
              </button>
            </span>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
