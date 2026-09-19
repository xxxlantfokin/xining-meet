import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "西宁遇见 · Xining Meet",
  description: "同城藏族轻松认识 — 西宁同城滑动交友 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} min-h-screen bg-stone-50 text-stone-900 antialiased`}>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
