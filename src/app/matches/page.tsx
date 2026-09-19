"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import LanguageToggle from "@/components/LanguageToggle";
import Toast from "@/components/Toast";
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
  const [toast, setToast] = useState("");

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

  async function copyWechat(wechatId: string) {
    try {
      await navigator.clipboard.writeText(wechatId);
      setToast(`${t("copied")}: ${wechatId}`);
      setTimeout(() => setToast(""), 1800);
    } catch {
      prompt(t("wechat"), wechatId);
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 pt-safe pb-nav">
      <header className="mb-5 flex items-center justify-between animate-fade-up">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-turquoise">
            {t("city")}
          </p>
          <h1 className="text-xl font-bold text-indigo-deep">{t("matches")}</h1>
        </div>
        <LanguageToggle />
      </header>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-28 rounded-3xl" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-4xl border border-dashed border-turquoise/30 bg-white/80 px-6 py-14 text-center shadow-soft animate-fade-up">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gold-mist text-2xl text-gold-deep">
            ♥
          </div>
          <p className="text-lg font-bold text-indigo-deep">{t("emptyMatches")}</p>
          <p className="mt-2 max-w-xs text-sm text-indigo-soft">{t("emptyMatchesHint")}</p>
          <Link
            href="/discover"
            className="pressable mt-5 inline-block rounded-full bg-turquoise px-5 py-2.5 text-sm font-semibold text-white shadow-soft"
          >
            {t("goDiscover")}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3 animate-fade-up">
          {matches.map((m) => (
            <li
              key={m.matchId}
              className="rounded-3xl border border-cream-300/80 bg-white p-4 shadow-soft transition hover:shadow-card"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.other.avatarUrl}
                  alt={m.other.name}
                  className="h-14 w-14 rounded-2xl object-cover ring-2 ring-cream-200"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-indigo-deep">
                    {m.other.name}
                    <span className="ml-1.5 text-sm font-normal text-indigo-soft">
                      {m.other.age}
                      {t("age")}
                    </span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-indigo-soft/80">{m.other.bio}</p>
                </div>
              </div>
              <div className="mt-3.5 flex gap-2">
                {m.threadId && (
                  <Link
                    href={`/chat/${m.threadId}`}
                    className="pressable flex-1 rounded-full bg-indigo-deep py-2.5 text-center text-sm font-semibold text-cream-50"
                  >
                    {t("chat")}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => copyWechat(m.wechatId)}
                  className="pressable flex-1 rounded-full border border-turquoise/25 bg-turquoise-mist py-2.5 text-sm font-semibold text-turquoise-deep"
                >
                  {t("copyWechat")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Toast message={toast} visible={!!toast} />
      <BottomNav />
    </main>
  );
}
