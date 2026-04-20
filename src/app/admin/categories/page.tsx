import { AdminShell } from "@/components/admin/admin-shell";
import { categories } from "@/data/works";

export default function CategoriesPage() {
  return (
    <AdminShell title="分类管理" description="维护作品分类，支持未来扩展多级分类结构。">
      <section className="panel p-6">
        <div className="mb-5 flex gap-3">
          <input placeholder="新增分类名称" className="h-11 flex-1 rounded-lg border border-line px-4 text-sm" />
          <button className="h-11 rounded-lg bg-ink px-5 text-sm font-medium text-white">新增分类</button>
        </div>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center justify-between rounded-lg border border-line p-4 text-sm">
              <span className="text-ink">{category}</span>
              <div className="flex gap-3 text-stone">
                <button>编辑</button>
                <button className="text-red-500">删除</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
