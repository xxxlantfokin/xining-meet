"use client";

import { useLang } from "./LangProvider";

export default function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div
      className="inline-flex rounded-full border border-indigo-mist/80 bg-white/90 p-0.5 text-xs shadow-soft backdrop-blur"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("zh")}
        className={`pressable-sm rounded-full px-3 py-1.5 font-semibold tracking-wide transition-all duration-200 ${
          lang === "zh"
            ? "bg-indigo-deep text-cream-50 shadow-sm"
            : "text-indigo-soft hover:text-indigo-deep"
        }`}
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => setLang("bo")}
        className={`pressable-sm rounded-full px-3 py-1.5 font-semibold tracking-wide transition-all duration-200 ${
          lang === "bo"
            ? "bg-turquoise text-white shadow-sm"
            : "text-indigo-soft hover:text-indigo-deep"
        }`}
      >
        བོད་ཡིག
      </button>
    </div>
  );
}
