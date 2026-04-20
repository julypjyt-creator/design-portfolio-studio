"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, FolderKanban, LayoutDashboard, PlusCircle, Tag, Layers3, ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";

const menus = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/works", label: "作品管理", icon: FolderKanban },
  { href: "/admin/works/new", label: "上传作品", icon: PlusCircle },
  { href: "/admin/categories", label: "分类管理", icon: Layers3 },
  { href: "/admin/tags", label: "标签管理", icon: Tag },
  { href: "/admin/analytics", label: "数据统计", icon: BarChart3 },
  { href: "/admin/settings", label: "权限预留", icon: ShieldCheck }
];

export function AdminShell({
  children,
  title,
  description
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store"
        });
        const data = (await response.json()) as { authenticated?: boolean };

        if (!data.authenticated) {
          const nextPath = pathname || "/admin";
          router.replace(`/admin/login?next=${encodeURIComponent(nextPath)}`);
          return;
        }

        if (mounted) {
          setAuthorized(true);
        }
      } catch {
        router.replace("/admin/login");
      }
    };

    setAuthorized(false);
    checkSession();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  if (!authorized) {
    return (
      <div className="container-wrap flex min-h-[60vh] items-center justify-center text-sm text-stone">
        正在验证登录状态...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[240px_1fr] md:px-8">
        <aside className="panel h-fit p-4">
          <p className="mb-6 text-xs font-semibold tracking-[0.22em] text-accent">ADMIN PANEL</p>
          <nav className="space-y-1">
            {menus.map((menu) => {
              const Icon = menu.icon;
              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone transition hover:bg-panel hover:text-ink"
                >
                  <Icon size={16} />
                  {menu.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="space-y-6">
          <header className="panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-ink">{title}</h1>
                <p className="mt-2 text-sm text-stone">{description}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/"
                  className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-sm font-medium text-ink transition hover:bg-panel"
                >
                  前台预览
                </Link>
                <LogoutButton />
              </div>
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
