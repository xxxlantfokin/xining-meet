"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import LanguageToggle from "@/components/LanguageToggle";
import MatchModal from "@/components/MatchModal";
import SwipeCard from "@/components/SwipeCard";
import { useLang } from "@/components/LangProvider";

type UserCard = {
  id: string;
  name: string;
  gender: string;
  age: number;
  city: string;
  bio: string;
  avatarUrl: string;
};

export default function DiscoverPage() {
  const { t } = useLang();
  const router = useRouter();
  const [candidates, setCandidates] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [matchInfo, setMatchInfo] = useState<{
    name: string;
    avatarUrl: string;
    threadId: string;
  } | null>(null);
  const [meName, setMeName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    if (!meData.user) {
      router.replace("/login");
      return;
    }
    setMeName(meData.user.name);
    const res = await fetch("/api/discover");
    if (res.status === 401) {
      router.replace("/login");
      return;
    }
    const data = await res.json();
    setCandidates(data.candidates ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function swipe(direction: "like" | "pass") {
    const current = candidates[0];
    if (!current || busy) return;
    setBusy(true);
    const res = await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: current.id, direction }),
    });
    const data = await res.json();
    setCandidates((prev) => prev.slice(1));
    setBusy(false);
    if (data.matched && data.threadId && data.other) {
      setMatchInfo({
        name: data.other.name,
        avatarUrl: data.other.avatarUrl,
        threadId: data.threadId,
      });
    }
  }

  const current = candidates[0];

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pt-4 pb-nav">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-amber-700">
            {t("city")} · {t("discover")}
          </p>
          <h1 className="text-xl font-bold text-stone-900">{t("appName")}</h1>
          {meName && (
            <p className="text-xs text-stone-500">{meName}</p>
          )}
        </div>
        <LanguageToggle />
      </header>

      <div className="relative mx-auto w-full flex-1" style={{ minHeight: "28rem", maxHeight: "34rem" }}>
        {loading ? (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-amber-200 bg-white/60 text-sm text-stone-400">
            加载中…
          </div>
        ) : !current ? (
          <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-amber-200 bg-white/70 px-6 text-center">
            <p className="text-lg font-semibold text-stone-700">{t("emptyDiscover")}</p>
            <p className="mt-2 text-sm text-stone-500">{t("emptyDiscoverHint")}</p>
            <button
              type="button"
              onClick={load}
              className="mt-4 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white"
            >
              刷新
            </button>
          </div>
        ) : (
          <SwipeCard
            user={current}
            ageLabel={t("age")}
            maleLabel={t("genderMale")}
            femaleLabel={t("genderFemale")}
          />
        )}
      </div>

      {current && (
        <div className="mt-5 flex items-center justify-center gap-6">
          <button
            type="button"
            disabled={busy}
            onClick={() => swipe("pass")}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-stone-200 bg-white text-2xl text-stone-500 shadow-md transition hover:border-stone-300 active:scale-95 disabled:opacity-50"
            aria-label={t("pass")}
          >
            ✕
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => swipe("like")}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-200 bg-rose-500 text-2xl text-white shadow-md transition hover:bg-rose-600 active:scale-95 disabled:opacity-50"
            aria-label={t("like")}
          >
            ♥
          </button>
        </div>
      )}

      {matchInfo && (
        <MatchModal
          name={matchInfo.name}
          avatarUrl={matchInfo.avatarUrl}
          threadId={matchInfo.threadId}
          matchedLabel={t("matched")}
          openChatLabel={t("openChat")}
          keepLabel={t("keepSwiping")}
          onClose={() => setMatchInfo(null)}
        />
      )}

      <BottomNav />
    </main>
  );
}
