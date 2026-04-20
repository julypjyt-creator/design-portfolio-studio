import Link from "next/link";

export function LogoutButton() {
  return (
    <Link
      href="/admin/logout"
      className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-sm font-medium text-ink transition hover:bg-panel"
    >
      退出登录
    </Link>
  );
}
