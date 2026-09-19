import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";

const notoSans = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "西宁遇见 · Xining Meet",
  description: "同城藏族轻松认识 — 西宁同城滑动交友 MVP",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1A1744",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${notoSans.variable} font-sans min-h-dvh text-indigo-deep antialiased`}
      >
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
