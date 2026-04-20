"use client";

import { useParams } from "next/navigation";
import { Chip } from "@/components/common/chip";
import { SiteShell } from "@/components/site/site-shell";
import { WorkGallery } from "@/components/works/work-gallery";
import { useWorks } from "@/lib/use-works";

export default function WorkDetailPage() {
  const params = useParams<{ id: string }>();
  const works = useWorks();
  const slug = params?.id;

  const work = works.find((item) => item.slug === slug);

  if (!work || !work.isPublic || work.status !== "已发布") {
    return (
      <SiteShell>
        <section className="container-wrap py-16">
          <div className="panel p-8 text-center">
            <h1 className="text-2xl font-semibold text-ink">作品不存在或未公开</h1>
            <p className="mt-2 text-sm text-stone">请返回作品列表查看已发布内容。</p>
          </div>
        </section>
      </SiteShell>
    );
  }

  const allImages = [work.coverImage, ...work.detailImages];

  return (
    <SiteShell>
      <section className="container-wrap grid gap-10 py-12 md:grid-cols-[1.25fr_0.75fr] md:py-16">
        <WorkGallery images={allImages} name={work.name} />
        <aside className="space-y-6">
          <div className="panel space-y-4 p-6">
            <h1 className="text-2xl font-semibold text-ink">{work.name}</h1>
            <p className="text-sm leading-7 text-stone">{work.summary}</p>
            <div className="flex flex-wrap gap-2">
              <Chip>{work.category}</Chip>
              {work.featured ? <Chip tone="accent">推荐作品</Chip> : null}
              <Chip>{work.projectType}</Chip>
            </div>
            <dl className="space-y-2 text-sm text-stone">
              <div className="flex justify-between gap-3">
                <dt>完成时间</dt>
                <dd>{work.completedAt}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>商业收录</dt>
                <dd>{work.commercialIncluded ? "是" : "否"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>商用状态</dt>
                <dd>{work.commercialUse ? "商用" : "非商用"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>项目状态</dt>
                <dd>{work.status}</dd>
              </div>
            </dl>
          </div>

          <div className="panel space-y-4 p-6">
            <h2 className="text-lg font-semibold text-ink">项目说明</h2>
            <p className="text-sm leading-7 text-stone">{work.projectBackground ?? "待补充项目背景信息"}</p>
            <p className="text-sm leading-7 text-stone">{work.designDescription ?? "待补充设计说明"}</p>
            <div className="space-y-2 text-sm text-stone">
              <p>使用软件：{work.software?.join(" / ") ?? "待补充"}</p>
              <p>交付内容：{work.deliverables?.join(" / ") ?? "待补充"}</p>
              <p>标签：{work.tags.join(" · ")}</p>
            </div>
          </div>
        </aside>
      </section>
    </SiteShell>
  );
}
