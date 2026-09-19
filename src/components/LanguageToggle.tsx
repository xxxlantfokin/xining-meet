"use client";

import { useLang } from "./LangProvider";

export default function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex rounded-full border border-amber-200/60 bg-white/80 p-0.5 text-xs shadow-sm">
      <button
        type="button"
        onClick={() => setLang("zh")}
        className={`rounded-full px-2.5 py-1 font-medium transition ${
          lang === "zh" ? "bg-amber-600 text-white" : "text-stone-600"
        }`}
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => setLang("bo")}
        className={`rounded-full px-2.5 py-1 font-medium transition ${
          lang === "bo" ? "bg-amber-600 text-white" : "text-stone-600"
        }`}
      >
        བོད་ཡིག
      </button>
    </div>
  );
}
