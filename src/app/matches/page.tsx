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
          <p className="text-[12px] font-medium tracking-[0.16em] text-teal">{t("city")}</p>
          <h1 className="text-[22px] font-semibold leading-[1.45] text-ink">{t("matches")}</h1>
        </div>
        <LanguageToggle />
      </header>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-28 rounded-[24px]" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-[28px] bg-cream-50 px-6 py-14 text-center shadow-soft animate-fade-up">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-mist text-[20px] text-gold-deep">
            ♥
          </div>
          <p className="text-[22px] font-semibold leading-[1.45] text-ink">{t("emptyMatches")}</p>
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
        <ul className="space-y-3 animate-fade-up">
          {matches.map((m) => (
            <li
              key={m.matchId}
              className="rounded-[24px] bg-cream-50 p-4 shadow-soft transition hover:shadow-card"
            >
              <div className="flex items-center gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.other.avatarUrl}
                  alt={m.other.name}
                  className="h-14 w-14 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-semibold leading-[1.45] text-ink">
                    {m.other.name}
                    <span className="ml-1.5 text-[13px] font-normal text-ink-soft">
                      {m.other.age}
                      {t("age")}
                    </span>
                  </p>
                  <p className="mt-0.5 truncate text-[13px] leading-[1.45] text-ink-mute">
                    {m.other.bio}
                  </p>
                </div>
              </div>
              <div className="mt-3.5 flex gap-2">
                {m.threadId && (
                  <Link
                    href={`/chat/${m.threadId}`}
                    className="pressable flex-1 rounded-full bg-ink py-2.5 text-center text-[15px] font-semibold text-cream-50"
                  >
                    {t("chat")}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => copyWechat(m.wechatId)}
                  className="pressable flex-1 rounded-full bg-teal-mist py-2.5 text-[15px] font-semibold text-teal-deep"
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
