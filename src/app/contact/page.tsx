"use client";

import { useState } from "react";
import { SiteShell } from "@/components/site/site-shell";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteShell>
      <section className="container-wrap py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="panel space-y-4 p-8">
            <h1 className="section-title">联系我</h1>
            <p className="text-sm leading-7 text-stone">欢迎咨询项目合作、方案优化与长期设计支持。</p>
            <ul className="space-y-2 text-sm text-stone">
              <li>邮箱：studio@example.com</li>
              <li>微信：studio-archive</li>
              <li>电话：+86 138 0000 0000</li>
            </ul>
          </div>

          <form
            className="panel space-y-4 p-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <h2 className="text-xl font-semibold text-ink">留言表单</h2>
            <input placeholder="你的称呼" className="h-11 w-full rounded-lg border border-line px-4 text-sm" required />
            <input placeholder="联系方式（邮箱/微信）" className="h-11 w-full rounded-lg border border-line px-4 text-sm" required />
            <textarea
              placeholder="请简要描述你的项目需求"
              className="min-h-32 w-full rounded-lg border border-line px-4 py-3 text-sm"
              required
            />
            <button type="submit" className="h-11 rounded-lg bg-ink px-6 text-sm font-medium text-white">
              提交留言
            </button>
            {sent ? <p className="text-sm text-accent">留言已提交，我会尽快回复你。</p> : null}
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
