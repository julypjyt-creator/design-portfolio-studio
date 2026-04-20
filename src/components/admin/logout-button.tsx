"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-sm font-medium text-ink transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "退出中..." : "退出登录"}
    </button>
  );
}
