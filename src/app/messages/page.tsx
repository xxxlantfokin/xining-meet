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
          <p className="text-[12px] font-medium tracking-[0.16em] text-teal">{t("city")}</p>
          <h1 className="text-[22px] font-semibold leading-[1.45] text-ink">{t("messages")}</h1>
        </div>
        <LanguageToggle />
      </header>

      {loading ? (
        <div className="overflow-hidden rounded-[24px] bg-cream-50 shadow-soft">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-cream-200 px-4 py-3.5 last:border-0"
            >
              <div className="skeleton h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-3 w-40 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-[28px] bg-cream-50 px-6 py-14 text-center shadow-soft animate-fade-up">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ink-mist text-[20px] text-ink-soft">
            ✉
          </div>
          <p className="text-[22px] font-semibold leading-[1.45] text-ink">{t("emptyMessages")}</p>
          <p className="mt-2 max-w-xs text-[15px] leading-[1.5] text-ink-soft">
            {t("emptyMatchesHint")}
          </p>
          <Link
            href="/discover"
            className="pressable mt-6 inline-block rounded-full bg-teal px-5 py-2.5 text-[15px] font-semibold text-cream-50 shadow-soft"
          >
            {t("goDiscover")}
          </Link>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-[24px] bg-cream-50 shadow-soft animate-fade-up">
          {threads.map((th) => (
            <li key={th.threadId} className="border-b border-cream-200 last:border-0">
              <Link
                href={`/chat/${th.threadId}`}
                className="pressable flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-cream-100/80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={th.other.avatarUrl}
                  alt={th.other.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-semibold leading-[1.45] text-ink">
                    {th.other.name}
                  </p>
                  <p className="truncate text-[13px] leading-[1.45] text-ink-mute">
                    {th.lastMessage?.body || t("wechatChatHint")}
                  </p>
                </div>
                <span className="text-ink-mute">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <BottomNav />
    </main>
  );
}
