"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

interface ContactMessage {
  id: string;
  name: string;
  contact: string;
  message: string;
  status: "new" | "read";
  createdAt: string;
}

async function fetchMessages() {
  const response = await fetch("/api/contact/messages", { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as {
    items?: ContactMessage[];
    unreadCount?: number;
  };
  return {
    items: Array.isArray(data.items) ? data.items : [],
    unreadCount: typeof data.unreadCount === "number" ? data.unreadCount : 0
  };
}

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("zh-CN", { hour12: false });
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [busyId, setBusyId] = useState("");

  const syncMessages = () => {
    setLoading(true);
    void fetchMessages()
      .then((data) => {
        setMessages(data.items);
        setUnreadCount(data.unreadCount);
        setErrorText("");
      })
      .catch(() => {
        setErrorText("留言加载失败，请稍后重试。");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    syncMessages();
  }, []);

  const summaryText = useMemo(() => `共 ${messages.length} 条留言，未读 ${unreadCount} 条`, [messages.length, unreadCount]);

  const markRead = async (id: string) => {
    setBusyId(id);
    const response = await fetch(`/api/contact/messages/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "read" })
    }).catch(() => null);
    setBusyId("");

    if (!response?.ok) {
      setErrorText("更新状态失败，请稍后重试。");
      return;
    }

    syncMessages();
  };

  const removeMessage = async (id: string) => {
    setBusyId(id);
    const response = await fetch(`/api/contact/messages/${encodeURIComponent(id)}`, {
      method: "DELETE"
    }).catch(() => null);
    setBusyId("");

    if (!response?.ok) {
      setErrorText("删除失败，请稍后重试。");
      return;
    }

    syncMessages();
  };

  const handleExportCsv = () => {
    window.location.href = "/api/contact/messages/export";
  };

  return (
    <AdminShell title="留言管理" description="收集并查看前台联系页面提交的留言。">
      <section className="panel space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-stone">{summaryText}</p>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!messages.length || loading}
            className="h-10 rounded-lg border border-line px-4 text-sm font-medium text-ink transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-60"
          >
            导出 CSV
          </button>
        </div>
        {errorText ? <p className="text-sm text-red-600">{errorText}</p> : null}

        {loading ? <p className="text-sm text-stone">留言加载中...</p> : null}

        {!loading && !messages.length ? <p className="text-sm text-stone">暂时还没有留言。</p> : null}

        <div className="space-y-3">
          {messages.map((item) => (
            <article key={item.id} className="rounded-xl border border-line bg-white p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink">{item.name}</h3>
                  <span className="text-xs text-stone">{item.contact}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${
                      item.status === "new" ? "border-amber-300 bg-amber-50 text-amber-700" : "border-line text-stone"
                    }`}
                  >
                    {item.status === "new" ? "未读" : "已读"}
                  </span>
                </div>
                <time className="text-xs text-stone">{formatTime(item.createdAt)}</time>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-6 text-stone">{item.message}</p>

              <div className="mt-4 flex gap-3 text-sm">
                {item.status === "new" ? (
                  <button type="button" disabled={busyId === item.id} className="text-accent disabled:opacity-60" onClick={() => void markRead(item.id)}>
                    标记已读
                  </button>
                ) : null}
                <button type="button" disabled={busyId === item.id} className="text-red-600 disabled:opacity-60" onClick={() => void removeMessage(item.id)}>
                  删除
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
