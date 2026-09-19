"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
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

type Dir = "like" | "pass";

export default function DiscoverPage() {
  const { t } = useLang();
  const router = useRouter();
  const [candidates, setCandidates] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [exitDir, setExitDir] = useState<Dir | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [pulse, setPulse] = useState<Dir | null>(null);
  const [matchInfo, setMatchInfo] = useState<{
    name: string;
    avatarUrl: string;
    threadId: string;
  } | null>(null);
  const [meName, setMeName] = useState("");
  const busyRef = useRef(false);
  const candidatesRef = useRef<UserCard[]>([]);

  useEffect(() => {
    candidatesRef.current = candidates;
  }, [candidates]);

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
    setExitDir(null);
    setBusy(false);
    busyRef.current = false;
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const swipe = useCallback(
    async (direction: Dir) => {
      if (busyRef.current) return;
      const current = candidatesRef.current[0];
      if (!current) return;

      busyRef.current = true;
      setBusy(true);
      setExitDir(direction);
      setPulse(direction);
      setTimeout(() => setPulse(null), 280);

      // Fire API immediately (don't block animation)
      const apiPromise = fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: current.id, direction }),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          return { ok: res.ok, data };
        })
        .catch(() => ({ ok: false, data: {} as Record<string, unknown> }));

      // Let fly-off animation play, then advance card (optimistic)
      await new Promise((r) => setTimeout(r, 420));

      const { ok, data } = await apiPromise;

      if (!ok) {
        // Roll back: remount same card
        setExitDir(null);
        setCardKey((k) => k + 1);
        busyRef.current = false;
        setBusy(false);
        return;
      }

      setCandidates((prev) => prev.filter((u) => u.id !== current.id));
      setExitDir(null);
      busyRef.current = false;
      setBusy(false);

      if (data?.matched && data.threadId && data.other) {
        setMatchInfo({
          name: data.other.name as string,
          avatarUrl: data.other.avatarUrl as string,
          threadId: data.threadId as string,
        });
      }
    },
    []
  );

  const current = candidates[0];
  const next = candidates[1];

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pt-safe pb-nav">
      <header className="mb-4 flex items-center justify-between animate-fade-up">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-turquoise">
            {t("city")} · {t("discover")}
          </p>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-indigo-deep">
            {t("appName")}
          </h1>
          {meName && (
            <p className="mt-0.5 text-xs text-indigo-soft/80">
              {meName}
              <Link
                href="/login"
                className="ml-2 text-turquoise underline-offset-2 hover:underline"
              >
                {t("switchAccount")}
              </Link>
            </p>
          )}
        </div>
        <LanguageToggle />
      </header>

      <div
        className="relative mx-auto w-full flex-1"
        style={{ minHeight: "28rem", maxHeight: "34rem" }}
      >
        {loading ? (
          <div className="flex h-full flex-col overflow-hidden rounded-4xl bg-white shadow-card ring-1 ring-cream-300/80">
            <div className="skeleton flex-1" />
            <div className="space-y-2 p-5">
              <div className="skeleton h-6 w-40 rounded-lg" />
              <div className="skeleton h-4 w-full rounded-lg" />
              <div className="skeleton h-4 w-3/4 rounded-lg" />
            </div>
          </div>
        ) : !current ? (
          <div className="flex h-full flex-col items-center justify-center rounded-4xl border border-dashed border-turquoise/30 bg-white/80 px-6 text-center shadow-soft animate-fade-up">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-turquoise-mist text-2xl text-turquoise">
              ✧
            </div>
            <p className="text-lg font-bold text-indigo-deep">{t("emptyDiscover")}</p>
            <p className="mt-2 max-w-xs text-sm text-indigo-soft">
              {t("emptyDiscoverHint")}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={load}
                className="pressable rounded-full bg-indigo-deep px-5 py-2.5 text-sm font-semibold text-cream-50 shadow-soft"
              >
                {t("refresh")}
              </button>
              <Link
                href="/matches"
                className="pressable rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-medium text-indigo-soft"
              >
                {t("matches")}
              </Link>
            </div>
          </div>
        ) : (
          <>
            {next && (
              <div className="pointer-events-none absolute inset-0 card-stack-behind">
                <div className="h-full w-full overflow-hidden rounded-4xl bg-cream-200 shadow-soft" />
              </div>
            )}
            <div className="absolute inset-0 z-10">
              <SwipeCard
                key={`${current.id}-${cardKey}`}
                user={current}
                ageLabel={t("age")}
                maleLabel={t("genderMale")}
                femaleLabel={t("genderFemale")}
                exitDir={exitDir}
                onSwipe={swipe}
                disabled={busy}
              />
            </div>
          </>
        )}
      </div>

      {current && (
        <div className="relative z-20 mt-6 flex items-center justify-center gap-10 animate-fade-up">
          <button
            type="button"
            disabled={busy}
            onClick={() => swipe("pass")}
            className={`pressable flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full border-2 border-cream-300 bg-white text-3xl text-indigo-soft shadow-soft transition hover:border-rose-300 hover:text-rose-500 disabled:opacity-50 ${
              pulse === "pass" ? "action-pop border-rose-400 text-rose-500" : ""
            }`}
            aria-label={t("pass")}
          >
            ✕
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => swipe("like")}
            className={`pressable flex h-[5rem] w-[5rem] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-3xl text-white shadow-float transition hover:brightness-110 disabled:opacity-50 ${
              pulse === "like" ? "action-pop ring-4 ring-rose-300/60" : ""
            }`}
            aria-label={t("like")}
          >
            ♥
          </button>
        </div>
      )}

      {current && (
        <p className="mt-3 text-center text-[11px] text-indigo-soft/60">
          {t("swipeHint")}
        </p>
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
