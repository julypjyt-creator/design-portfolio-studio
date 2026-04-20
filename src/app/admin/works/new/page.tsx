import { AdminShell } from "@/components/admin/admin-shell";
import { WorkForm } from "@/components/admin/work-form";

export default function NewWorkPage() {
  return (
    <AdminShell title="上传作品" description="支持封面图、详情图、多字段编辑和上传进度反馈。">
      <WorkForm />
    </AdminShell>
  );
}
