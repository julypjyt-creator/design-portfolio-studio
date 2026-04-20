"use client";

import { SiteShell } from "@/components/site/site-shell";
import { WorksGrid } from "@/components/works/works-grid";
import { useWorks } from "@/lib/use-works";

export default function WorksPage() {
  const works = useWorks();
  const visibleWorks = works.filter((w) => w.isPublic && w.status === "已发布");

  return (
    <SiteShell>
      <section className="container-wrap space-y-8 py-12 md:py-16">
        <header>
          <h1 className="section-title">作品合集</h1>
          <p className="section-subtitle">
            以卡片流方式展示作品，支持分类筛选、关键词搜索与排序，便于访客快速定位感兴趣的项目。
          </p>
        </header>
        <WorksGrid items={visibleWorks} />
      </section>
    </SiteShell>
  );
}
