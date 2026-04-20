import type { Metadata } from "next";
import { Manrope, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-cn"
});

export const metadata: Metadata = {
  title: "Studio Archive | 设计作品档案馆",
  description: "个人/工作室作品展示与管理平台"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${manrope.variable} ${notoSansSC.variable}`}>
      <body>{children}</body>
    </html>
  );
}
