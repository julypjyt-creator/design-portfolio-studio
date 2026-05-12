"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site/site-shell";
import { WorkCard } from "@/components/works/work-card";
import { categories } from "@/data/works";
import { useWorks } from "@/lib/use-works";

export default function HomePage() {
  const visibleWorks = useWorks("public");
  const featured = visibleWorks.filter((w) => w.featured).slice(0, 3);
  const latest = [...visibleWorks].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, 3);

  return (
    <SiteShell>
      <section className="container-wrap space-y-14 py-12 md:py-16">
        <div className="grid gap-10 rounded-xl2 border border-line bg-white p-8 shadow-card md:grid-cols-2 md:p-12">
          <div className="space-y-5">
            <p className="text-xs tracking-[0.24em] text-accent">PERSONAL / STUDIO PORTFOLIO</p>
            <h1 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">July的娱乐画廊</h1>
            <p className="max-w-xl text-sm leading-7 text-stone md:text-base">
              记录了一些July在AI探索中的创作，强调作品视觉表现、信息结构、色彩调和，涵盖海报设计、平面设计、建筑渲染等多个领域。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/works" className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white">
                浏览全部作品
              </Link>
              <Link href="/admin" className="rounded-lg border border-line px-5 py-2.5 text-sm font-medium text-ink">
                进入后台管理
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {categories.slice(0, 4).map((category) => (
              <div key={category} className="rounded-xl border border-line bg-panel p-5">
                <p className="text-sm text-stone">作品分类</p>
                <p className="mt-2 text-lg font-semibold text-ink">{category}</p>
              </div>
            ))}
          </div>
        </div>

        <section>
          <h2 className="section-title">精选作品</h2>
          <p className="section-subtitle">突出代表案例，建立专业形象与风格辨识度。</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="section-title">最新作品</h2>
              <p className="section-subtitle">持续更新的近期项目与交付成果。</p>
            </div>
            <Link href="/works" className="text-sm text-accent hover:underline">
              查看更多
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {latest.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>
      </section>
    </SiteShell>
  );
}
