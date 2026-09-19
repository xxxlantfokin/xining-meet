"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LanguageToggle from "@/components/LanguageToggle";
import { useLang } from "@/components/LangProvider";

type User = {
  id: string;
  name: string;
  gender: string;
  age: number;
  city: string;
  bio: string;
  avatarUrl: string;
};

const DEMO_IDS = new Set(["demo-tsering", "demo-dolma"]);

export default function LoginPage() {
  const { t } = useLang();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);

  useEffect(() => {
    // Clear prior session so demo account switching is intentional
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      fetch("/api/users")
        .then((r) => r.json())
        .then((d) => setUsers(d.users ?? []))
        .finally(() => setLoading(false));
    });
  }, []);

  async function login(userId: string) {
    setLoggingIn(userId);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      router.push("/discover");
      router.refresh();
    } else {
      setLoggingIn(null);
      alert("登录失败");
    }
  }

  const order = ["demo-tsering", "demo-dolma"];
  const recommended = order
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is User => !!u);
  const others = users.filter((u) => !DEMO_IDS.has(u.id));

  function UserButton({ u, badge }: { u: User; badge?: string }) {
    const busy = loggingIn === u.id;
    return (
      <button
        type="button"
        disabled={!!loggingIn}
        onClick={() => login(u.id)}
        className="pressable group flex w-full items-center gap-3 rounded-2.5xl border border-cream-300/80 bg-white p-3.5 text-left shadow-soft transition hover:border-turquoise/40 hover:shadow-card disabled:opacity-60"
      >
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={u.avatarUrl}
            alt={u.name}
            className="h-14 w-14 rounded-2xl bg-indigo-mist object-cover ring-2 ring-cream-200 transition group-hover:ring-turquoise/40"
          />
          {badge && (
            <span className="absolute -right-1 -top-1 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold text-indigo-deep shadow-sm">
              {badge}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-indigo-deep">
            {u.name}
            <span className="ml-2 text-xs font-normal text-indigo-soft">
              {u.age}
              {t("age")} · {u.gender === "male" ? t("genderMale") : t("genderFemale")}
            </span>
          </p>
          <p className="mt-0.5 truncate text-xs leading-relaxed text-indigo-soft/80">
            {u.bio}
          </p>
        </div>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition ${
            busy
              ? "bg-turquoise text-white"
              : "bg-cream-100 text-turquoise group-hover:bg-turquoise group-hover:text-white"
          }`}
        >
          {busy ? "…" : "→"}
        </span>
      </button>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-10 pt-safe">
      <div className="mb-8 flex items-start justify-between animate-fade-up">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold-mist/60 px-3 py-1 text-[11px] font-semibold text-gold-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-turquoise" />
            {t("city")}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-deep">
            {t("appName")}
          </h1>
          <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-indigo-soft">
            {t("tagline")}
          </p>
        </div>
        <LanguageToggle />
      </div>

      <div className="rounded-4xl border border-cream-300/90 bg-white/90 p-5 shadow-card backdrop-blur animate-fade-up">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-bold text-indigo-deep">{t("login")}</h2>
          <span className="text-[10px] font-medium uppercase tracking-wider text-turquoise">
            Demo
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-indigo-soft">{t("loginHint")}</p>

        {loading ? (
          <div className="mt-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-[4.5rem] rounded-2.5xl" />
            ))}
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {recommended.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                  {t("demoPair")}
                </p>
                <ul className="space-y-2.5">
                  {recommended.map((u) => (
                    <li key={u.id}>
                      <UserButton u={u} badge="★" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {others.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-soft">
                  {t("moreAccounts")}
                </p>
                <ul className="space-y-2.5">
                  {others.map((u) => (
                    <li key={u.id}>
                      <UserButton u={u} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2.5xl border border-dashed border-turquoise/25 bg-turquoise-mist/40 px-4 py-3.5 text-center animate-fade-up">
        <p className="text-xs leading-relaxed text-turquoise-deep">{t("demoTip")}</p>
      </div>
    </main>
  );
}
