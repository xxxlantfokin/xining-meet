"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import LanguageToggle from "@/components/LanguageToggle";
import { useLang } from "@/components/LangProvider";

type MatchItem = {
  matchId: string;
  threadId: string | null;
  createdAt: string;
  other: {
    id: string;
    name: string;
    age: number;
    avatarUrl: string;
    bio: string;
  };
  wechatId: string;
};

export default function MatchesPage() {
  const { t } = useLang();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/matches")
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setMatches(d.matches ?? []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function copyWechat(id: string, wechatId: string) {
    try {
      await navigator.clipboard.writeText(wechatId);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      prompt("微信号", wechatId);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 pt-4 pb-nav">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">{t("matches")}</h1>
        <LanguageToggle />
      </header>

      {loading ? (
        <p className="text-center text-sm text-stone-400">加载中…</p>
      ) : matches.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-amber-200 bg-white/70 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-stone-700">{t("emptyMatches")}</p>
          <p className="mt-2 text-sm text-stone-500">{t("emptyMatchesHint")}</p>
          <Link
            href="/discover"
            className="mt-4 inline-block rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white"
          >
            {t("discover")}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {matches.map((m) => (
            <li
              key={m.matchId}
              className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.other.avatarUrl}
                  alt={m.other.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {m.other.name}
                    <span className="ml-1 text-sm font-normal text-stone-500">
                      {m.other.age}
                      {t("age")}
                    </span>
                  </p>
                  <p className="truncate text-xs text-stone-500">{m.other.bio}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {m.threadId && (
                  <Link
                    href={`/chat/${m.threadId}`}
                    className="flex-1 rounded-full bg-amber-600 py-2 text-center text-sm font-medium text-white"
                  >
                    {t("chat")}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => copyWechat(m.matchId, m.wechatId)}
                  className="flex-1 rounded-full border border-emerald-200 bg-emerald-50 py-2 text-sm font-medium text-emerald-800"
                >
                  {copied === m.matchId ? t("copied") : t("copyWechat")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <BottomNav />
    </main>
  );
}
