"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  const isDisabled = useMemo(() => loading || !username.trim() || !password, [loading, username, password]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorText("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      setErrorText(data.message || "登录失败，请重试");
      setLoading(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  };

  return (
    <>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-sm text-stone">
          账号
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-11 w-full rounded-lg border border-line px-4 text-sm"
            placeholder="请输入账号"
          />
        </label>
        <label className="block space-y-2 text-sm text-stone">
          密码
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-lg border border-line px-4 text-sm"
            placeholder="请输入密码"
          />
        </label>

        <button
          type="submit"
          disabled={isDisabled}
          className="h-11 w-full rounded-lg bg-ink px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>

      {errorText ? <p className="mt-4 text-sm text-red-600">{errorText}</p> : null}
    </>
  );
}
