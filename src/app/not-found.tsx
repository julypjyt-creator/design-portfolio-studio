import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-wrap flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
      <h1 className="text-4xl font-semibold text-ink">404</h1>
      <p className="text-sm text-stone">页面不存在或内容未公开。</p>
      <Link href="/works" className="rounded-lg bg-ink px-4 py-2 text-sm text-white">
        返回作品列表
      </Link>
    </main>
  );
}
