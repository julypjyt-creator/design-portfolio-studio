"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

async function fetchCategories() {
  const response = await fetch("/api/categories", { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as { items?: string[] };
  return Array.isArray(data.items) ? data.items : [];
}

export default function CategoriesPage() {
  const [newCategory, setNewCategory] = useState("");
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [editingCategory, setEditingCategory] = useState("");
  const [editingValue, setEditingValue] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyCategory, setBusyCategory] = useState("");

  useEffect(() => {
    const sync = () => {
      void fetchCategories()
        .then((items) => setCategoryList(items))
        .catch(() => {
          // Keep previous list if request fails.
        });
    };

    sync();
    window.addEventListener("categories-updated", sync);

    return () => {
      window.removeEventListener("categories-updated", sync);
    };
  }, []);

  const countText = useMemo(() => `共 ${categoryList.length} 个分类`, [categoryList.length]);

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    setErrorText("");

    const normalized = newCategory.trim();
    if (!normalized) {
      setErrorText("请输入分类名称");
      return;
    }

    if (categoryList.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      setErrorText("该分类已存在");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/categories", {
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
      setCategoryList(data.items);
    }
    setNewCategory("");
    window.dispatchEvent(new Event("categories-updated"));
  };

  const startEdit = (category: string) => {
    setErrorText("");
    setEditingCategory(category);
    setEditingValue(category);
  };

  const cancelEdit = () => {
    setEditingCategory("");
    setEditingValue("");
  };

  const handleSaveEdit = async (source: string) => {
    setErrorText("");
    const normalized = editingValue.trim();

    if (!normalized) {
      setErrorText("分类名称不能为空");
      return;
    }

    if (
      categoryList.some((item) => item.toLowerCase() === normalized.toLowerCase()) &&
      source.toLowerCase() !== normalized.toLowerCase()
    ) {
      setErrorText("该分类已存在");
      return;
    }

    setBusyCategory(source);
    const response = await fetch(`/api/categories/${encodeURIComponent(source)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: normalized })
    }).catch(() => null);
    setBusyCategory("");

    if (!response?.ok) {
      setErrorText("编辑失败，请稍后重试");
      return;
    }

    const data = (await response.json().catch(() => ({}))) as { items?: string[] };
    if (Array.isArray(data.items)) {
      setCategoryList(data.items);
    }

    cancelEdit();
    window.dispatchEvent(new Event("categories-updated"));
    window.dispatchEvent(new Event("works-updated"));
  };

  const handleDelete = async (category: string) => {
    setErrorText("");
    setBusyCategory(category);

    const response = await fetch(`/api/categories/${encodeURIComponent(category)}`, {
      method: "DELETE"
    }).catch(() => null);
    setBusyCategory("");

    if (!response?.ok) {
      setErrorText("删除失败，请稍后重试");
      return;
    }

    const data = (await response.json().catch(() => ({}))) as { items?: string[] };
    if (Array.isArray(data.items)) {
      setCategoryList(data.items);
    }

    if (editingCategory === category) {
      cancelEdit();
    }

    window.dispatchEvent(new Event("categories-updated"));
    window.dispatchEvent(new Event("works-updated"));
  };

  return (
    <AdminShell title="分类管理" description="维护作品分类，支持未来扩展多级分类结构。">
      <section className="panel p-6">
        <form className="mb-2 flex gap-3" onSubmit={(event) => void handleAdd(event)}>
          <input
            placeholder="新增分类名称"
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            className="h-11 flex-1 rounded-lg border border-line px-4 text-sm"
          />
          <button type="submit" disabled={isSubmitting} className="h-11 rounded-lg bg-ink px-5 text-sm font-medium text-white disabled:opacity-60">
            {isSubmitting ? "新增中..." : "新增分类"}
          </button>
        </form>

        <p className="mb-4 text-xs text-stone">{countText}</p>
        {errorText ? <p className="mb-4 text-sm text-red-600">{errorText}</p> : null}

        <div className="space-y-2">
          {categoryList.map((category) => {
            const isEditing = editingCategory === category;
            const isBusy = busyCategory === category;

            return (
              <div key={category} className="flex items-center justify-between rounded-lg border border-line p-4 text-sm">
                {isEditing ? (
                  <input
                    value={editingValue}
                    onChange={(event) => setEditingValue(event.target.value)}
                    className="h-10 flex-1 rounded-lg border border-line px-3 text-sm"
                  />
                ) : (
                  <span className="text-ink">{category}</span>
                )}

                <div className="ml-4 flex gap-3 text-stone">
                  {isEditing ? (
                    <>
                      <button type="button" disabled={isBusy} onClick={() => void handleSaveEdit(category)} className="disabled:opacity-60">
                        保存
                      </button>
                      <button type="button" disabled={isBusy} onClick={cancelEdit} className="disabled:opacity-60">
                        取消
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" disabled={Boolean(editingCategory) || isBusy} onClick={() => startEdit(category)} className="disabled:opacity-60">
                        编辑
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(editingCategory) || isBusy}
                        onClick={() => void handleDelete(category)}
                        className="text-red-500 disabled:opacity-60"
                      >
                        删除
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
