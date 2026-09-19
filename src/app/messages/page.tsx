"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import LanguageToggle from "@/components/LanguageToggle";
import { useLang } from "@/components/LangProvider";

type ThreadItem = {
  threadId: string;
  other: { id: string; name: string; avatarUrl: string };
  lastMessage: { body: string; createdAt: string } | null;
};

export default function MessagesPage() {
  const { t } = useLang();
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/threads")
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setThreads(d.threads ?? []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 pt-safe pb-nav">
      <header className="mb-5 flex items-center justify-between animate-fade-up">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-turquoise">
            {t("city")}
          </p>
          <h1 className="text-xl font-bold text-indigo-deep">{t("messages")}</h1>
        </div>
        <LanguageToggle />
      </header>

      {loading ? (
        <div className="overflow-hidden rounded-3xl border border-cream-300/80 bg-white shadow-soft">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 border-b border-cream-200 px-4 py-3.5 last:border-0">
              <div className="skeleton h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-3 w-40 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-4xl border border-dashed border-turquoise/30 bg-white/80 px-6 py-14 text-center shadow-soft animate-fade-up">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-mist text-2xl text-indigo-soft">
            ✉
          </div>
          <p className="text-lg font-bold text-indigo-deep">{t("emptyMessages")}</p>
          <p className="mt-2 max-w-xs text-sm text-indigo-soft">{t("emptyMatchesHint")}</p>
          <Link
            href="/discover"
            className="pressable mt-5 inline-block rounded-full bg-turquoise px-5 py-2.5 text-sm font-semibold text-white shadow-soft"
          >
            {t("goDiscover")}
          </Link>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-3xl border border-cream-300/80 bg-white shadow-soft animate-fade-up">
          {threads.map((th) => (
            <li key={th.threadId} className="border-b border-cream-200 last:border-0">
              <Link
                href={`/chat/${th.threadId}`}
                className="pressable flex items-center gap-3 px-4 py-3.5 transition hover:bg-cream-100/80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={th.other.avatarUrl}
                  alt={th.other.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-cream-200"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-indigo-deep">{th.other.name}</p>
                  <p className="truncate text-xs text-indigo-soft/80">
                    {th.lastMessage?.body || t("wechatHint")}
                  </p>
                </div>
                <span className="text-indigo-mist">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <BottomNav />
    </main>
  );
}
