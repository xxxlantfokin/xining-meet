"use client";

import { useLang } from "./LangProvider";

export default function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div
      className="inline-flex rounded-full bg-cream-50 p-0.5 text-[12px] shadow-soft ring-1 ring-cream-300/80"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("zh")}
        className={`pressable-sm rounded-full px-3 py-1.5 font-semibold transition-colors duration-200 ${
          lang === "zh" ? "bg-ink text-cream-50" : "text-ink-soft hover:text-ink"
        }`}
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => setLang("bo")}
        className={`pressable-sm rounded-full px-3 py-1.5 font-semibold transition-colors duration-200 ${
          lang === "bo" ? "bg-teal text-cream-50" : "text-ink-soft hover:text-ink"
        }`}
      >
        བོད་ཡིག
      </button>
    </div>
  );
}
