export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-white">
      <div className="container-wrap flex flex-col gap-2 py-8 text-sm text-stone md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Studio Archive. All rights reserved.</p>
        <p>个人 / 工作室作品展示与管理平台</p>
      </div>
    </footer>
  );
}
