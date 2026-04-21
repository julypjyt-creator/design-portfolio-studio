"use client";

import { FormEvent, useEffect, useState } from "react";
import { SiteShell } from "@/components/site/site-shell";

interface ContactSettings {
  email: string;
  wechat: string;
  phone: string;
}

const fallbackSettings: ContactSettings = {
  email: "studio@example.com",
  wechat: "studio-archive",
  phone: "+86 138 0000 0000"
};

async function fetchContactSettings() {
  const response = await fetch("/api/contact", { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as { settings?: ContactSettings };
  return data.settings;
}

export default function ContactPage() {
  const [settings, setSettings] = useState<ContactSettings>(fallbackSettings);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    const syncSettings = () => {
      void fetchContactSettings()
        .then((next) => {
          if (next) {
            setSettings(next);
          }
        })
        .catch(() => {
          // Keep fallback settings.
        });
    };

    syncSettings();
    window.addEventListener("contact-settings-updated", syncSettings);
    return () => {
      window.removeEventListener("contact-settings-updated", syncSettings);
    };
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSent(false);
    setErrorText("");

    const payload = {
      name: name.trim(),
      contact: contact.trim(),
      message: message.trim()
    };

    if (!payload.name || !payload.contact || !payload.message) {
      setErrorText("请完整填写所有字段。");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => null);
    setIsSubmitting(false);

    if (!response?.ok) {
      const data = (await response?.json().catch(() => ({}))) as { message?: string };
      setErrorText(data.message ?? "提交失败，请稍后重试。");
      return;
    }

    setSent(true);
    setName("");
    setContact("");
    setMessage("");
  };

  return (
    <SiteShell>
      <section className="container-wrap py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="panel space-y-4 p-8">
            <h1 className="section-title">联系我</h1>
            <p className="text-sm leading-7 text-stone">欢迎咨询项目合作、方案优化与长期设计支持。</p>
            <ul className="space-y-2 text-sm text-stone">
              <li>邮箱：{settings.email}</li>
              <li>微信：{settings.wechat}</li>
              <li>电话：{settings.phone}</li>
            </ul>
          </div>

          <form className="panel space-y-4 p-8" onSubmit={(event) => void handleSubmit(event)}>
            <h2 className="text-xl font-semibold text-ink">留言表单</h2>
            <input
              placeholder="你的称呼"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11 w-full rounded-lg border border-line px-4 text-sm"
              required
            />
            <input
              placeholder="联系方式（邮箱/微信/电话）"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              className="h-11 w-full rounded-lg border border-line px-4 text-sm"
              required
            />
            <textarea
              placeholder="请简要描述你的项目需求"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-32 w-full rounded-lg border border-line px-4 py-3 text-sm"
              required
            />
            <button type="submit" disabled={isSubmitting} className="h-11 rounded-lg bg-ink px-6 text-sm font-medium text-white disabled:opacity-60">
              {isSubmitting ? "提交中..." : "提交留言"}
            </button>
            {errorText ? <p className="text-sm text-red-600">{errorText}</p> : null}
            {sent ? <p className="text-sm text-accent">留言已提交，我会尽快回复你。</p> : null}
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
