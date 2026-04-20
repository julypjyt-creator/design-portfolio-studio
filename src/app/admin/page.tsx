"use client";

import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { getKpis } from "@/lib/stats";
import { useWorks } from "@/lib/use-works";

export default function AdminHomePage() {
  const works = useWorks("all");
  const kpis = getKpis(works);

  const cards = [
    { label: "作品总数", value: kpis.total },
    { label: "推荐作品", value: kpis.featured },
    { label: "公开展示", value: kpis.publicCount },
    { label: "商业收录", value: kpis.commercialIncluded }
  ];

  return (
    <AdminShell title="后台概览" description="快速查看作品资产状态与关键运营指标。">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="panel p-5">
            <p className="text-sm text-stone">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">最近作品</h2>
          <Link href="/admin/works" className="text-sm text-accent hover:underline">
            查看全部
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-panel text-left text-stone">
              <tr>
                <th className="px-4 py-3">作品名</th>
                <th className="px-4 py-3">分类</th>
                <th className="px-4 py-3">完成时间</th>
                <th className="px-4 py-3">状态</th>
              </tr>
            </thead>
            <tbody>
              {[...works]
                .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                .slice(0, 5)
                .map((work) => (
                  <tr key={work.id} className="border-t border-line">
                    <td className="px-4 py-3 font-medium text-ink">{work.name}</td>
                    <td className="px-4 py-3 text-stone">{work.category}</td>
                    <td className="px-4 py-3 text-stone">{work.completedAt}</td>
                    <td className="px-4 py-3 text-stone">{work.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
