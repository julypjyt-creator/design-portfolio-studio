"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Work } from "@/lib/types";
import { loadWorksFromStorage, removeWorkFromStorage } from "@/lib/work-storage";

export function WorksTable({ works }: { works: Work[] }) {
  const [rows, setRows] = useState<Work[]>(works);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("全部");
  const [category, setCategory] = useState("全部");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setRows(loadWorksFromStorage());
  }, []);

  const categories = useMemo(() => [...new Set(rows.map((w) => w.category))], [rows]);
  const statuses = useMemo(() => [...new Set(rows.map((w) => w.status))], [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((w) => {
        const matchQuery = [w.name, w.summary, w.tags.join(" ")].join(" ").toLowerCase().includes(query.toLowerCase());
        const matchStatus = status === "全部" || w.status === status;
        const matchCategory = category === "全部" || w.category === category;
        return matchQuery && matchStatus && matchCategory;
      }),
    [rows, query, status, category]
  );

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
      return;
    }
    setSelected(filtered.map((w) => w.id));
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDelete = (id: string) => {
    const next = removeWorkFromStorage(id);
    setRows(next);
    setSelected((prev) => prev.filter((item) => item !== id));
  };

  return (
    <div className="panel overflow-hidden">
      <div className="grid gap-3 border-b border-line p-4 md:grid-cols-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索作品"
          className="h-10 rounded-lg border border-line px-3 text-sm"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-lg border border-line px-3 text-sm">
          <option value="全部">全部分类</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border border-line px-3 text-sm">
          <option value="全部">全部状态</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="h-10 rounded-lg bg-ink px-4 text-sm font-medium text-white">批量操作（{selected.length}）</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-panel text-left text-stone">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selected.length === filtered.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3">作品名称</th>
              <th className="px-4 py-3">分类</th>
              <th className="px-4 py-3">完成日期</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">公开</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((work) => (
              <tr key={work.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.includes(work.id)} onChange={() => toggleSelect(work.id)} />
                </td>
                <td className="px-4 py-3 font-medium text-ink">{work.name}</td>
                <td className="px-4 py-3 text-stone">{work.category}</td>
                <td className="px-4 py-3 text-stone">{work.completedAt}</td>
                <td className="px-4 py-3 text-stone">{work.status}</td>
                <td className="px-4 py-3 text-stone">{work.isPublic ? "公开" : "不公开"}</td>
                <td className="px-4 py-3 text-stone">
                  <div className="flex gap-3">
                    <Link href={`/admin/works/${work.id}/edit`} className="hover:text-ink">
                      编辑
                    </Link>
                    <Link href={`/works/${work.slug}`} className="hover:text-ink" target="_blank" rel="noreferrer">
                      预览
                    </Link>
                    <button className="text-red-500" onClick={() => handleDelete(work.id)}>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
