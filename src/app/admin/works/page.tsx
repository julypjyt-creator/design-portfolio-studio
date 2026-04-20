"use client";

import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { WorksTable } from "@/components/admin/works-table";
import { useWorks } from "@/lib/use-works";

function toCsvCell(value: string | number | boolean) {
  const text = String(value ?? "");
  const escaped = text.replace(/"/g, "\"\"");
  return `"${escaped}"`;
}

export default function AdminWorksPage() {
  const works = useWorks("all");

  const handleExport = () => {
    const headers = [
      "ID",
      "作品名称",
      "分类",
      "项目类型",
      "完成日期",
      "状态",
      "公开展示",
      "推荐作品",
      "商业收录",
      "商用",
      "标签",
      "项目简介",
      "创建时间",
      "更新时间"
    ];

    const rows = works.map((work) => [
      work.id,
      work.name,
      work.category,
      work.projectType,
      work.completedAt,
      work.status,
      work.isPublic ? "是" : "否",
      work.featured ? "是" : "否",
      work.commercialIncluded ? "是" : "否",
      work.commercialUse ? "是" : "否",
      work.tags.join(" / "),
      work.summary,
      work.createdAt,
      work.updatedAt
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => toCsvCell(cell)).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `作品列表_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell title="作品管理" description="查看、筛选和批量管理作品，支持上下架与状态流转。">
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-panel"
        >
          导出列表
        </button>
        <Link href="/admin/works/new" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white">
          上传新作品
        </Link>
      </div>
      <WorksTable works={works} />
    </AdminShell>
  );
}
