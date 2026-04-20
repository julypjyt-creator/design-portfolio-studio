import { SiteShell } from "@/components/site/site-shell";

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="container-wrap py-12 md:py-16">
        <div className="panel space-y-8 p-8 md:p-12">
          <header>
            <h1 className="section-title">关于我 / 关于工作室</h1>
            <p className="section-subtitle">专注空间视觉与图面表达，提供从概念到交付的完整设计支持。</p>
          </header>
          <div className="grid gap-8 text-sm leading-7 text-stone md:grid-cols-2">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-ink">设计方向</h2>
              <p>室内空间设计、彩平图深化、效果图转译、室外景观节点表达。</p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold text-ink">服务范围</h2>
              <p>住宅 / 商业空间 / 公共空间 / 文旅景观项目的视觉表达与资料整理。</p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold text-ink">擅长风格</h2>
              <p>现代极简、自然质感、结构化排版，强调空间秩序与光影层次。</p>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold text-ink">合作方式</h2>
              <p>支持按项目阶段合作，可远程协同，支持标准化交付文件与版本管理。</p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
