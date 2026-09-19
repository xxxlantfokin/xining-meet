"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import LanguageToggle from "@/components/LanguageToggle";
import MatchModal from "@/components/MatchModal";
import SwipeCard from "@/components/SwipeCard";
import Toast from "@/components/Toast";
import { useLang } from "@/components/LangProvider";

type UserCard = {
  id: string;
  name: string;
  gender: string;
  age: number;
  city: string;
  bio: string;
  avatarUrl: string;
  hometown?: string;
  dialect?: string;
};

type Dir = "like" | "pass";

const EXIT_WAIT = 280;

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
  const [me, setMe] = useState<{ name: string; avatarUrl: string } | null>(null);
  const [toast, setToast] = useState("");
  const [nearbyHint, setNearbyHint] = useState(false);
  const busyRef = useRef(false);
  const candidatesRef = useRef<UserCard[]>([]);

  useEffect(() => {
    candidatesRef.current = candidates;
  }, [candidates]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1400);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setNearbyHint(false);
    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    if (!meData.user) {
      router.replace("/login");
      return;
    }
    setMe({ name: meData.user.name, avatarUrl: meData.user.avatarUrl });
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
      setTimeout(() => setPulse(null), 240);
      showToast(direction === "like" ? t("likedToast") : t("passedToast"));

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

      await new Promise((r) => setTimeout(r, EXIT_WAIT));

      const { ok, data } = await apiPromise;

      if (!ok) {
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
        setToast("");
        setMatchInfo({
          name: data.other.name as string,
          avatarUrl: data.other.avatarUrl as string,
          threadId: data.threadId as string,
        });
      }
    },
    [showToast, t]
  );

  const current = candidates[0];
  const next = candidates[1];
  const third = candidates[2];

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pt-safe pb-nav">
      <header className="mb-4 flex items-center justify-between animate-fade-up">
        <div>
          <p className="text-[12px] font-medium tracking-[0.16em] text-teal">
            {t("city")} · {t("discover")}
          </p>
          <h1 className="mt-0.5 text-[22px] font-semibold leading-[1.45] tracking-tight text-ink">
            {t("appName")}
          </h1>
          {me && (
            <p className="mt-0.5 text-[12px] leading-[1.45] text-ink-mute">
              {me.name}
              <Link
                href="/login"
                className="ml-2 text-teal underline-offset-2 hover:underline"
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
        style={{ minHeight: "min(62dvh, 34rem)", maxHeight: "36rem" }}
      >
        {loading ? (
          <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-cream-50 shadow-card">
            <div className="skeleton flex-1" />
            <div className="space-y-2.5 p-5">
              <div className="skeleton h-6 w-36 rounded-lg" />
              <div className="skeleton h-4 w-full rounded-lg" />
              <div className="skeleton h-4 w-3/4 rounded-lg" />
            </div>
          </div>
        ) : !current ? (
          <div className="flex h-full flex-col items-center justify-center rounded-[28px] bg-cream-50 px-6 text-center shadow-soft animate-fade-up">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-mist text-[20px] text-teal">
              ✧
            </div>
            <p className="text-[22px] font-semibold leading-[1.45] text-ink">
              {nearbyHint ? t("emptyNearby") : t("emptyDiscover")}
            </p>
            {!nearbyHint && (
              <p className="mt-2 max-w-xs text-[15px] leading-[1.5] text-ink-soft">
                {t("emptyDiscoverHint")}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              {!nearbyHint ? (
                <button
                  type="button"
                  onClick={() => {
                    setNearbyHint(true);
                    load();
                  }}
                  className="pressable rounded-full bg-teal px-5 py-2.5 text-[15px] font-semibold text-cream-50 shadow-soft"
                >
                  {t("refresh")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={load}
                  className="pressable rounded-full bg-teal px-5 py-2.5 text-[15px] font-semibold text-cream-50 shadow-soft"
                >
                  {t("seeNearby")}
                </button>
              )}
              <Link
                href="/me"
                className="pressable rounded-full bg-cream-200/80 px-5 py-2.5 text-[15px] font-medium text-ink-soft"
              >
                {t("editProfile")}
              </Link>
            </div>
          </div>
        ) : (
          <>
            {third && (
              <div className="pointer-events-none absolute inset-0 card-stack-behind">
                <div className="h-full w-full overflow-hidden rounded-[28px] bg-cream-300/80 shadow-soft" />
              </div>
            )}
            {next && (
              <div className="pointer-events-none absolute inset-0 card-stack-mid">
                <div className="h-full w-full overflow-hidden rounded-[28px] bg-cream-200 shadow-soft" />
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
        <div className="relative z-20 mt-5 flex items-center justify-center gap-9 animate-fade-up">
          <button
            type="button"
            disabled={busy}
            onClick={() => swipe("pass")}
            className={`pressable flex h-[4rem] w-[4rem] items-center justify-center rounded-full bg-cream-50 text-[26px] text-ink-soft shadow-soft ring-1 ring-cream-300 transition hover:text-ink disabled:opacity-50 ${
              pulse === "pass" ? "action-pop" : ""
            }`}
            aria-label={t("pass")}
          >
            ✕
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => swipe("like")}
            className={`pressable flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full bg-teal text-[28px] text-cream-50 shadow-float transition hover:bg-teal-deep disabled:opacity-50 ${
              pulse === "like" ? "action-pop" : ""
            }`}
            aria-label={t("like")}
          >
            ♥
          </button>
        </div>
      )}

      {current && (
        <p className="mt-3 text-center text-[12px] leading-[1.45] text-ink-mute">
          {t("swipeHint")}
        </p>
      )}

      {matchInfo && me && (
        <MatchModal
          myName={me.name}
          myAvatarUrl={me.avatarUrl}
          name={matchInfo.name}
          avatarUrl={matchInfo.avatarUrl}
          threadId={matchInfo.threadId}
          matchedLabel={t("matched")}
          openChatLabel={t("openChat")}
          keepLabel={t("keepSwiping")}
          onClose={() => setMatchInfo(null)}
        />
      )}

      <Toast message={toast} visible={!!toast} />
      <BottomNav />
    </main>
  );
}
