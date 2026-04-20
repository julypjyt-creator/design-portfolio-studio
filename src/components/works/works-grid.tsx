"use client";

import { useMemo, useState } from "react";
import { categories } from "@/data/works";
import { Work } from "@/lib/types";
import { WorkCard } from "@/components/works/work-card";

type SortBy = "latest" | "oldest" | "name";

export function WorksGrid({ items }: { items: Work[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [sortBy, setSortBy] = useState<SortBy>("latest");

  const filtered = useMemo(() => {
    const result = items
      .filter((item) => (activeCategory === "全部" ? true : item.category === activeCategory))
      .filter((item) =>
        [item.name, item.summary, item.tags.join(" ")].join(" ").toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "oldest") return a.completedAt.localeCompare(b.completedAt);
        return b.completedAt.localeCompare(a.completedAt);
      });

    return result;
  }, [items, activeCategory, query, sortBy]);

  return (
    <section className="space-y-6">
      <div className="panel p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索作品名称 / 标签 / 简介"
            className="h-11 rounded-lg border border-line px-4 text-sm outline-none ring-accent transition focus:ring-2"
          />
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="h-11 rounded-lg border border-line px-4 text-sm outline-none ring-accent transition focus:ring-2"
          >
            <option value="全部">全部分类</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="h-11 rounded-lg border border-line px-4 text-sm outline-none ring-accent transition focus:ring-2"
          >
            <option value="latest">按完成时间（新到旧）</option>
            <option value="oldest">按完成时间（旧到新）</option>
            <option value="name">按名称</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>
      {!filtered.length ? (
        <div className="panel p-8 text-center text-sm text-stone">当前筛选条件下暂无作品</div>
      ) : null}
    </section>
  );
}
