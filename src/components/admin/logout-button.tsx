"use client";

export function LogoutButton() {
  const handleLogout = () => {
    // Use full-page navigation to ensure Set-Cookie on logout response is always applied.
    window.location.assign(`/admin/logout?t=${Date.now()}`);
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-sm font-medium text-ink transition hover:bg-panel"
    >
      退出登录
    </button>
  );
}
