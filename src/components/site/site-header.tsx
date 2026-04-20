import Link from "next/link";

const links = [
  { href: "/", label: "首页" },
  { href: "/works", label: "作品" },
  { href: "/about", label: "关于" },
  { href: "/contact", label: "联系" },
  { href: "/admin", label: "后台" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white/80 backdrop-blur">
      <div className="container-wrap flex h-16 items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-[0.2em] text-ink">
          STUDIO ARCHIVE
        </Link>
        <nav className="flex items-center gap-6 text-sm text-stone">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
