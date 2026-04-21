import { isAdminAuthenticated } from "@/lib/server/auth-guard";
import { listContactMessages } from "@/lib/server/contact-storage";

export const dynamic = "force-dynamic";

function escapeCsvCell(value: string) {
  const normalized = String(value ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return `"${normalized.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return new Response("未授权访问", { status: 401 });
  }

  const items = await listContactMessages();
  const header = ["id", "name", "contact", "message", "status", "createdAt"];
  const rows = items.map((item) =>
    [item.id, item.name, item.contact, item.message, item.status === "new" ? "未读" : "已读", item.createdAt]
      .map((cell) => escapeCsvCell(cell))
      .join(",")
  );

  const csv = `\uFEFF${header.join(",")}\n${rows.join("\n")}`;
  const fileName = `contact-messages-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store"
    }
  });
}
