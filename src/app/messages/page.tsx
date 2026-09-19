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
    <main className="mx-auto min-h-screen max-w-lg px-4 pt-4 pb-nav">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">{t("messages")}</h1>
        <LanguageToggle />
      </header>

      {loading ? (
        <p className="text-center text-sm text-stone-400">加载中…</p>
      ) : threads.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-amber-200 bg-white/70 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-stone-700">{t("emptyMessages")}</p>
          <p className="mt-2 text-sm text-stone-500">{t("emptyMatchesHint")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
          {threads.map((th) => (
            <li key={th.threadId}>
              <Link
                href={`/chat/${th.threadId}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-amber-50/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={th.other.avatarUrl}
                  alt={th.other.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-stone-800">{th.other.name}</p>
                  <p className="truncate text-xs text-stone-500">
                    {th.lastMessage?.body || t("wechatHint")}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <BottomNav />
    </main>
  );
}
