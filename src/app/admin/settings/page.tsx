"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

interface ContactSettings {
  email: string;
  wechat: string;
  phone: string;
}

async function fetchContactSettings() {
  const response = await fetch("/api/contact", { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as { settings?: ContactSettings };
  return data.settings;
}

export default function SettingsPage() {
  const [form, setForm] = useState<ContactSettings>({
    email: "",
    wechat: "",
    phone: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    void fetchContactSettings()
      .then((settings) => {
        if (settings) {
          setForm(settings);
        }
      })
      .catch(() => {
        setErrorText("联系信息加载失败，请稍后重试。");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setErrorText("");
    setSaving(true);

    const response = await fetch("/api/contact", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }).catch(() => null);

    setSaving(false);

    if (!response?.ok) {
      const data = (await response?.json().catch(() => ({}))) as { message?: string };
      setErrorText(data.message ?? "保存失败，请稍后重试。");
      return;
    }

    setMessage("联系信息已保存，前台“联系我”页面会立即使用新内容。");
    window.dispatchEvent(new Event("contact-settings-updated"));
  };

  return (
    <AdminShell title="联系设置" description="维护前台“联系我”展示信息与后台运维预留项。">
      <section className="panel space-y-5 p-6">
        {loading ? <p className="text-sm text-stone">联系信息加载中...</p> : null}

        <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void handleSubmit(event)}>
          <label className="space-y-2 text-sm text-stone">
            联系邮箱
            <input
              required
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="h-11 w-full rounded-lg border border-line px-4 text-sm"
              placeholder="例如：studio@domain.com"
            />
          </label>
          <label className="space-y-2 text-sm text-stone">
            联系微信
            <input
              required
              value={form.wechat}
              onChange={(event) => setForm((prev) => ({ ...prev, wechat: event.target.value }))}
              className="h-11 w-full rounded-lg border border-line px-4 text-sm"
              placeholder="例如：julycreator-studio"
            />
          </label>
          <label className="space-y-2 text-sm text-stone md:col-span-2">
            联系电话
            <input
              required
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="h-11 w-full rounded-lg border border-line px-4 text-sm"
              placeholder="例如：+86 138 0000 0000"
            />
          </label>

          <div className="md:col-span-2 flex items-center gap-3">
            <button type="submit" disabled={saving || loading} className="h-11 rounded-lg bg-ink px-6 text-sm font-medium text-white disabled:opacity-60">
              {saving ? "保存中..." : "保存联系信息"}
            </button>
            {message ? <p className="text-sm text-accent">{message}</p> : null}
          </div>
        </form>

        {errorText ? <p className="text-sm text-red-600">{errorText}</p> : null}
      </section>

      <section className="panel space-y-3 p-6 text-sm text-stone">
        <p>当前角色：Admin（唯一管理员）</p>
        <p>预留角色：Editor / Viewer</p>
        <p>后续可扩展：菜单权限、数据范围权限、操作审计日志。</p>
      </section>
    </AdminShell>
  );
}
