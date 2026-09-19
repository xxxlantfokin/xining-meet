"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "./LangProvider";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();
  const items = [
    { href: "/discover", label: t("discover"), icon: "✧" },
    { href: "/matches", label: t("matches"), icon: "♥" },
    { href: "/messages", label: t("messages"), icon: "✉" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-amber-100 bg-white/95 backdrop-blur safe-pb">
      <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs transition ${
                active
                  ? "bg-amber-50 text-amber-800 font-semibold"
                  : "text-stone-500"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
