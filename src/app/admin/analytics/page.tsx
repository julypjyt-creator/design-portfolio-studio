"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryPie, MonthlyBar, TrendLine } from "@/components/dashboard/charts";
import { getCategoryDistributionFrom, getKpis, getMonthlyCompletions, getRecentTrend } from "@/lib/stats";
import { useWorks } from "@/lib/use-works";

export default function AnalyticsPage() {
  const works = useWorks();
  const [yearFilter, setYearFilter] = useState("全部");
  const years = useMemo(() => ["全部", ...new Set(works.map((w) => w.completedAt.slice(0, 4)))], [works]);

  const monthlyRaw = getMonthlyCompletions(works);
  const monthly = yearFilter === "全部" ? monthlyRaw : monthlyRaw.filter((item) => item.month.startsWith(yearFilter));

  const kpis = getKpis(works);
  const cards = [
    { label: "作品总数", value: kpis.total, helper: "全量作品资产" },
    { label: "推荐作品", value: kpis.featured, helper: "首页精选" },
    { label: "公开展示", value: kpis.publicCount, helper: `未公开 ${kpis.privateCount}` },
    { label: "商用占比", value: `${kpis.commercialUseRate}%`, helper: `商用 ${kpis.commercialUse}` }
  ];

  return (
    <AdminShell title="数据统计" description="通过可视化看板洞察作品结构、完成节奏与商业化情况。">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="panel p-5">
            <p className="text-sm text-stone">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{card.value}</p>
            <p className="mt-2 text-xs text-stone">{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="panel p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink">时间筛选</p>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="h-10 rounded-lg border border-line px-3 text-sm"
          >
            {years.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <CategoryPie data={getCategoryDistributionFrom(works)} />
        <MonthlyBar data={monthly} />
      </section>

      <TrendLine data={getRecentTrend(works)} />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel p-5 text-sm text-stone">
          <p className="mb-1 text-ink">商业收录情况</p>
          <p>已收录：{kpis.commercialIncluded}</p>
          <p>未收录：{kpis.commercialNotIncluded}</p>
        </article>
        <article className="panel p-5 text-sm text-stone">
          <p className="mb-1 text-ink">商用情况</p>
          <p>商用作品：{kpis.commercialUse}</p>
          <p>占比：{kpis.commercialUseRate}%</p>
        </article>
        <article className="panel p-5 text-sm text-stone">
          <p className="mb-1 text-ink">展示状态</p>
          <p>公开：{kpis.publicCount}</p>
          <p>未公开：{kpis.privateCount}</p>
        </article>
      </section>
    </AdminShell>
  );
}
