"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LanguageToggle from "@/components/LanguageToggle";
import Toast from "@/components/Toast";
import { useLang } from "@/components/LangProvider";

type Msg = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
};

export default function ChatPage() {
  const { t } = useLang();
  const params = useParams();
  const threadId = params.threadId as string;
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [other, setOther] = useState<{ name: string; avatarUrl: string } | null>(null);
  const [wechatId, setWechatId] = useState("");
  const [meId, setMeId] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    if (!meData.user) {
      router.replace("/login");
      return;
    }
    setMeId(meData.user.id);

    const res = await fetch(`/api/threads/${threadId}/messages`);
    if (res.status === 401) {
      router.replace("/login");
      return;
    }
    if (!res.ok) {
      router.replace("/messages");
      return;
    }
    const data = await res.json();
    setMessages(data.messages ?? []);
    setOther(data.other);
    setWechatId(data.wechatId ?? "");
    setLoading(false);
  }, [threadId, router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    const res = await fetch(`/api/threads/${threadId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setText("");
      inputRef.current?.focus();
    }
    setSending(false);
  }

  async function copyWechat() {
    if (!wechatId) return;
    try {
      await navigator.clipboard.writeText(wechatId);
      setToast(`${t("copied")}: ${wechatId}`);
      setTimeout(() => setToast(""), 1800);
    } catch {
      prompt(t("wechat"), wechatId);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-cream-300/80 bg-cream-50/95 px-3 py-3 backdrop-blur-md pt-safe">
        <Link
          href="/messages"
          className="pressable-sm flex h-9 w-9 items-center justify-center rounded-full bg-white text-indigo-deep shadow-soft ring-1 ring-cream-300"
          aria-label="Back"
        >
          ←
        </Link>
        {other && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={other.avatarUrl}
              alt={other.name}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-cream-200"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-indigo-deep">{other.name}</p>
              <p className="text-[10px] text-indigo-soft/70">{t("wechatHint")}</p>
            </div>
          </>
        )}
        <LanguageToggle />
      </header>

      {wechatId && (
        <div className="border-b border-turquoise/15 bg-turquoise-mist/50 px-4 py-2.5">
          <button
            type="button"
            onClick={copyWechat}
            className="pressable flex w-full items-center justify-between gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm shadow-soft ring-1 ring-turquoise/20"
          >
            <span className="min-w-0 truncate text-turquoise-deep">
              {t("wechat")}:{" "}
              <span className="font-mono font-semibold">{wechatId}</span>
            </span>
            <span className="shrink-0 rounded-full bg-turquoise px-3 py-1 text-xs font-semibold text-white">
              {t("copyWechat")}
            </span>
          </button>
        </div>
      )}

      <div className="chat-scroll flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="space-y-3 pt-4">
            <div className="skeleton ml-0 h-10 w-2/3 rounded-2xl rounded-bl-md" />
            <div className="skeleton ml-auto h-10 w-1/2 rounded-2xl rounded-br-md" />
            <div className="skeleton ml-0 h-10 w-1/2 rounded-2xl rounded-bl-md" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-mist text-xl text-indigo-soft">
              ✦
            </div>
            <p className="text-sm font-medium text-indigo-deep">{t("chatEmpty")}</p>
            <p className="mt-1 text-xs text-indigo-soft">{t("chatEmptyHint")}</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = m.senderId === meId;
            return (
              <div
                key={m.id}
                className={`flex animate-fade-up ${mine ? "justify-end" : "justify-start"}`}
                style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
              >
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed shadow-soft ${
                    mine
                      ? "rounded-2xl rounded-br-md bg-indigo-deep text-cream-50"
                      : "rounded-2xl rounded-bl-md bg-white text-indigo-deep ring-1 ring-cream-300/80"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="sticky bottom-0 flex gap-2 border-t border-cream-300/80 bg-cream-50/95 p-3 backdrop-blur-md safe-pb"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("placeholder")}
          className="flex-1 rounded-full border border-cream-300 bg-white px-4 py-2.5 text-sm text-indigo-deep outline-none transition placeholder:text-indigo-soft/50 focus:border-turquoise/50 focus:ring-2 focus:ring-turquoise/20"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="pressable rounded-full bg-turquoise px-5 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-40"
        >
          {t("send")}
        </button>
      </form>

      <Toast message={toast} visible={!!toast} />
    </main>
  );
}
