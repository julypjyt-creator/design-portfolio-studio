import { AdminShell } from "@/components/admin/admin-shell";

export default function SettingsPage() {
  return (
    <AdminShell title="权限预留" description="当前默认单管理员，保留多角色扩展结构。">
      <section className="panel space-y-4 p-6 text-sm text-stone">
        <p>当前角色：Admin（唯一管理员）</p>
        <p>预留角色：Editor / Viewer</p>
        <p>后续可扩展：菜单权限、数据范围权限、操作审计日志。</p>
      </section>
    </AdminShell>
  );
}
