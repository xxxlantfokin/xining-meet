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

  function UserButton({ u, featured }: { u: User; featured?: boolean }) {
    const busy = loggingIn === u.id;
    return (
      <button
        type="button"
        disabled={!!loggingIn}
        onClick={() => login(u.id)}
        className={`pressable group flex w-full items-center gap-3.5 rounded-[20px] bg-cream-50 p-3.5 text-left shadow-soft transition hover:shadow-card disabled:opacity-60 ${
          featured ? "ring-1 ring-teal/25" : "ring-1 ring-cream-300/70"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={u.avatarUrl}
          alt={u.name}
          className="h-14 w-14 rounded-2xl bg-ink-mist object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold leading-[1.45] text-ink">
            {u.name}
            <span className="ml-2 text-[13px] font-normal text-ink-soft">
              {u.age}
              {t("age")} · {u.gender === "male" ? t("genderMale") : t("genderFemale")}
            </span>
          </p>
          <p className="mt-0.5 truncate text-[13px] leading-[1.45] text-ink-mute">{u.bio}</p>
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] transition ${
            busy ? "bg-teal text-cream-50" : "bg-cream-200 text-teal group-hover:bg-teal group-hover:text-cream-50"
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
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cream-50 px-3 py-1 text-[12px] font-medium text-ink-soft shadow-soft ring-1 ring-cream-300/80">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            {t("city")}
          </div>
          <h1 className="text-[24px] font-semibold leading-[1.45] tracking-tight text-ink">
            {t("appName")}
          </h1>
          <p className="mt-2 max-w-[17rem] text-[15px] leading-[1.5] text-ink-soft">
            {t("tagline")}
          </p>
        </div>
        <LanguageToggle />
      </div>

      <div className="rounded-[28px] bg-cream-50 p-5 shadow-card animate-fade-up">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-[16px] font-semibold text-ink">{t("login")}</h2>
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-mute">
            Demo
          </span>
        </div>
        <p className="mt-1 text-[13px] leading-[1.45] text-ink-soft">{t("loginHint")}</p>

        {loading ? (
          <div className="mt-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-[4.5rem] rounded-[20px]" />
            ))}
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {recommended.length > 0 && (
              <div>
                <p className="mb-2.5 text-[12px] font-medium tracking-[0.12em] text-ink-mute">
                  {t("demoPair")}
                </p>
                <ul className="space-y-2.5">
                  {recommended.map((u) => (
                    <li key={u.id}>
                      <UserButton u={u} featured />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {others.length > 0 && (
              <div>
                <p className="mb-2.5 text-[12px] font-medium tracking-[0.12em] text-ink-mute">
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

      <div className="mt-5 rounded-[20px] bg-teal-mist/50 px-4 py-3.5 text-center animate-fade-up">
        <p className="text-[13px] leading-[1.5] text-teal-deep">{t("demoTip")}</p>
      </div>
    </main>
  );
}
