"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "./LangProvider";

const icons = {
  discover: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  ),
  matches: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 21s-6.5-4.35-9.33-8.1C.8 10.4 1.4 6.9 4.2 5.4c1.8-.95 4-.4 5.3 1.15L12 9.1l2.5-2.55c1.3-1.55 3.5-2.1 5.3-1.15 2.8 1.5 3.4 5 1.53 7.5C18.5 16.65 12 21 12 21z" />
    </svg>
  ),
  messages: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v8a2.5 2.5 0 01-2.5 2.5H9l-4 3v-3.5A2.5 2.5 0 014 14.5v-8z" strokeLinejoin="round" />
    </svg>
  ),
};

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();
  const items = [
    { href: "/discover", label: t("discover"), icon: icons.discover },
    { href: "/matches", label: t("matches"), icon: icons.matches },
    { href: "/messages", label: t("messages"), icon: icons.messages },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-cream-300/80 bg-cream-50/95 backdrop-blur-md safe-pb">
      <div className="mx-auto flex max-w-lg justify-around px-3 py-2">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`pressable-sm flex min-w-[4.75rem] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium transition-all duration-200 ${
                active
                  ? "bg-indigo-deep text-cream-50 shadow-soft"
                  : "text-indigo-soft hover:bg-white/70 hover:text-indigo-deep"
              }`}
            >
              <span className={active ? "text-gold-soft" : ""}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
