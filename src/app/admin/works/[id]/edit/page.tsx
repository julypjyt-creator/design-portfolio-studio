"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { WorkForm } from "@/components/admin/work-form";
import { useWorks } from "@/lib/use-works";

export default function EditWorkPage() {
  const params = useParams<{ id: string }>();
  const works = useWorks("all");
  const work = works.find((item) => item.id === params?.id);

  if (!work) {
    return (
      <AdminShell title="编辑作品" description="未找到对应作品，可能已被删除。">
        <div className="panel p-6 text-sm text-stone">
          <p>该作品不存在。</p>
          <Link href="/admin/works" className="mt-3 inline-block text-accent underline">
            返回作品管理
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="编辑作品" description="修改作品信息并保存。">
      <WorkForm initialWork={work} />
    </AdminShell>
  );
}
