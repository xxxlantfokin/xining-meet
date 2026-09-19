"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import LanguageToggle from "@/components/LanguageToggle";
import Toast from "@/components/Toast";
import { useLang } from "@/components/LangProvider";
import type { Lang } from "@/lib/i18n";

type MeUser = {
  id: string;
  name: string;
  gender: string;
  age: number;
  city: string;
  bio: string;
  avatarUrl: string;
  wechatId: string;
  hometown: string;
  dialect: string;
  languagePref: Lang;
};

export default function MePage() {
  const { t, setLang } = useLang();
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [bio, setBio] = useState("");
  const [wechatId, setWechatId] = useState("");
  const [city, setCity] = useState("西宁");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [hometown, setHometown] = useState("");
  const [dialect, setDialect] = useState("");
  const [languagePref, setLanguagePref] = useState<Lang>("zh");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.replace("/login");
          return;
        }
        const u = d.user as MeUser;
        setUser(u);
        setBio(u.bio ?? "");
        setWechatId(u.wechatId ?? "");
        setCity(u.city || "西宁");
        setAvatarUrl(u.avatarUrl ?? "");
        setHometown(u.hometown ?? "");
        setDialect(u.dialect ?? "");
        setLanguagePref(u.languagePref === "bo" ? "bo" : "zh");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: bio.trim().slice(0, 40),
          wechatId: wechatId.trim(),
          city: city.trim() || "西宁",
          avatarUrl: avatarUrl.trim(),
          hometown: hometown.trim(),
          dialect: dialect.trim(),
          languagePref,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(t("saveFailed"));
        return;
      }
      const u = data.user as MeUser;
      setUser(u);
      setBio(u.bio);
      setWechatId(u.wechatId);
      setCity(u.city || "西宁");
      setAvatarUrl(u.avatarUrl);
      setHometown(u.hometown ?? "");
      setDialect(u.dialect ?? "");
      setLanguagePref(u.languagePref === "bo" ? "bo" : "zh");
      setLang(u.languagePref === "bo" ? "bo" : "zh");
      showToast(t("saved"));
    } catch {
      showToast(t("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  const fieldClass =
    "w-full rounded-2xl border-0 bg-cream-100 px-3.5 py-3 text-[15px] leading-[1.5] text-ink outline-none ring-1 ring-cream-300 transition placeholder:text-ink-mute focus:bg-cream-50 focus:ring-2 focus:ring-teal/30";

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 pt-safe pb-nav">
      <header className="mb-5 flex items-center justify-between animate-fade-up">
        <div>
          <p className="text-[12px] font-medium tracking-[0.16em] text-teal">{t("city")}</p>
          <h1 className="text-[22px] font-semibold leading-[1.45] text-ink">{t("profileTitle")}</h1>
          <p className="mt-0.5 text-[13px] leading-[1.45] text-ink-mute">{t("profileSubtitle")}</p>
        </div>
        <LanguageToggle />
      </header>

      {loading || !user ? (
        <div className="space-y-4 animate-fade-up">
          <div className="skeleton h-28 rounded-[24px]" />
          <div className="skeleton h-64 rounded-[24px]" />
        </div>
      ) : (
        <div className="space-y-4 animate-fade-up">
          <section className="rounded-[24px] bg-cream-50 p-5 shadow-soft">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal text-[22px] font-semibold text-cream-50">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[18px] font-semibold leading-[1.45] text-ink">
                  {user.name}
                  <span className="ml-2 text-[13px] font-normal text-ink-soft">
                    {user.age}
                    {t("age")} ·{" "}
                    {user.gender === "male" ? t("genderMale") : t("genderFemale")}
                  </span>
                </p>
                <p className="mt-1 text-[12px] leading-[1.45] text-ink-mute">
                  {t("accountLabel")}:{" "}
                  <span className="font-mono text-teal">{user.id}</span>
                </p>
              </div>
            </div>
          </section>

          <form
            onSubmit={onSave}
            className="space-y-4 rounded-[24px] bg-cream-50 p-5 shadow-soft"
          >
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-ink-mute">
                {t("avatarLabel")}
              </span>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder={t("avatarPlaceholder")}
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-ink-mute">
                {t("bioLabel")}
              </span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 40))}
                rows={2}
                maxLength={40}
                placeholder={t("bioPlaceholder")}
                className={`${fieldClass} resize-none`}
              />
              <span className="mt-1 block text-right text-[12px] text-ink-mute">
                {bio.length}/40
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-ink-mute">
                {t("cityLabel")}
              </span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={40}
                placeholder={t("cityPlaceholder")}
                className={fieldClass}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-ink-mute">
                  {t("hometownLabel")}
                </span>
                <input
                  type="text"
                  value={hometown}
                  onChange={(e) => setHometown(e.target.value)}
                  maxLength={40}
                  placeholder={t("hometownPlaceholder")}
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-ink-mute">
                  {t("dialectLabel")}
                </span>
                <input
                  type="text"
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value)}
                  maxLength={40}
                  placeholder={t("dialectPlaceholder")}
                  className={fieldClass}
                />
              </label>
            </div>

            <div>
              <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-ink-mute">
                {t("languagePrefLabel")}
              </span>
              <div className="inline-flex rounded-full bg-cream-100 p-0.5 ring-1 ring-cream-300">
                <button
                  type="button"
                  onClick={() => setLanguagePref("zh")}
                  className={`pressable-sm rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                    languagePref === "zh" ? "bg-ink text-cream-50" : "text-ink-soft"
                  }`}
                >
                  {t("langZh")}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguagePref("bo")}
                  className={`pressable-sm rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                    languagePref === "bo" ? "bg-teal text-cream-50" : "text-ink-soft"
                  }`}
                >
                  {t("langBo")}
                </button>
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-ink-mute">
                {t("wechatLabel")}
              </span>
              <input
                type="text"
                value={wechatId}
                onChange={(e) => setWechatId(e.target.value)}
                maxLength={40}
                required
                placeholder={t("wechatPlaceholder")}
                className={`${fieldClass} font-mono`}
              />
              <span className="mt-1.5 block text-[12px] leading-[1.45] text-teal-deep">
                {t("wechatHint")}
              </span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="pressable w-full rounded-full bg-teal py-3.5 text-[15px] font-semibold text-cream-50 shadow-soft transition hover:bg-teal-deep disabled:opacity-50"
            >
              {saving ? t("saving") : t("saveProfile")}
            </button>
          </form>

          <section className="rounded-[24px] bg-cream-50 p-4 shadow-soft">
            <p className="mb-2.5 text-[12px] font-medium tracking-[0.12em] text-ink-mute">
              {t("profilePreview")}
            </p>
            <div className="overflow-hidden rounded-[20px]">
              <div className="relative h-36 bg-ink-mist">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover object-top" />
                ) : null}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 pt-10 text-cream-50">
                  <p className="text-[16px] font-semibold leading-[1.45]">
                    {user.name}
                    <span className="ml-2 text-[13px] font-medium text-cream-200">
                      {user.age}
                      {t("age")}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[12px] leading-[1.45] text-cream-200/90">
                    {city || "西宁"}
                    {hometown ? ` · ${hometown}` : ""}
                    {dialect ? ` · ${dialect}` : ""}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.45] text-cream-100/95">
                    {bio || "…"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex gap-2.5 pt-1">
            <Link
              href="/discover"
              className="pressable flex-1 rounded-full bg-cream-50 py-3 text-center text-[15px] font-medium text-ink-soft shadow-soft"
            >
              {t("goDiscover")}
            </Link>
            <button
              type="button"
              onClick={logout}
              className="pressable flex-1 rounded-full bg-cream-50 py-3 text-[15px] font-medium text-ink-mute shadow-soft"
            >
              {t("logout")}
            </button>
          </div>
        </div>
      )}

      <Toast message={toast} visible={!!toast} />
      <BottomNav />
    </main>
  );
}
