"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { addTagToStorage, loadTagsFromStorage, removeTagFromStorage } from "@/lib/tag-storage";

export default function TagsPage() {
  const [newTag, setNewTag] = useState("");
  const [tagList, setTagList] = useState<string[]>([]);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    const sync = () => setTagList(loadTagsFromStorage());
    sync();

    window.addEventListener("storage", sync);
    window.addEventListener("tags-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("tags-updated", sync);
    };
  }, []);

  const countText = useMemo(() => `共 ${tagList.length} 个标签`, [tagList.length]);

  const handleAdd = (event: FormEvent) => {
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

    const next = addTagToStorage(normalized);
    setTagList(next);
    setNewTag("");
  };

  const handleDelete = (tag: string) => {
    const next = removeTagFromStorage(tag);
    setTagList(next);
  };

  return (
    <AdminShell title="标签管理" description="统一维护作品标签，方便筛选和统计分析。">
      <section className="panel p-6">
        <form className="mb-2 flex gap-3" onSubmit={handleAdd}>
          <input
            placeholder="新增标签"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="h-11 flex-1 rounded-lg border border-line px-4 text-sm"
          />
          <button type="submit" className="h-11 rounded-lg bg-ink px-5 text-sm font-medium text-white">
            新增标签
          </button>
        </form>

        <p className="mb-4 text-xs text-stone">{countText}</p>
        {errorText ? <p className="mb-4 text-sm text-red-600">{errorText}</p> : null}

        <div className="flex flex-wrap gap-2">
          {tagList.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-stone">
              {tag}
              <button type="button" className="text-xs text-red-500" onClick={() => handleDelete(tag)}>
                删除
              </button>
            </span>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
