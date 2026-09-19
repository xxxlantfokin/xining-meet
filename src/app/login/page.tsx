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

export default function LoginPage() {
  const { t } = useLang();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .finally(() => setLoading(false));
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

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-amber-700">{t("city")}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">
            {t("appName")}
          </h1>
          <p className="mt-2 text-sm text-stone-500">{t("tagline")}</p>
        </div>
        <LanguageToggle />
      </div>

      <div className="rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm">
        <h2 className="font-semibold text-stone-800">{t("login")}</h2>
        <p className="mt-1 text-xs text-stone-500">{t("loginHint")}</p>

        {loading ? (
          <p className="mt-6 text-center text-sm text-stone-400">加载中…</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {users.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  disabled={!!loggingIn}
                  onClick={() => login(u.id)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50/80 p-3 text-left transition hover:border-amber-200 hover:bg-amber-50/60 disabled:opacity-60"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.avatarUrl}
                    alt={u.name}
                    className="h-12 w-12 rounded-full bg-amber-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-800">
                      {u.name}
                      <span className="ml-2 text-xs font-normal text-stone-500">
                        {u.age}
                        {t("age")} · {u.gender === "male" ? t("genderMale") : t("genderFemale")}
                      </span>
                    </p>
                    <p className="truncate text-xs text-stone-500">{u.bio}</p>
                  </div>
                  <span className="text-xs text-amber-700">
                    {loggingIn === u.id ? "…" : "→"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-stone-400">
        演示建议：用「才仁」右滑喜欢「卓玛」，再用「卓玛」登录右滑喜欢「才仁」完成匹配。
      </p>
    </main>
  );
}
