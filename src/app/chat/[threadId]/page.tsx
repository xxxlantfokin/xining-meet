"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LanguageToggle from "@/components/LanguageToggle";
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
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
    }
    setSending(false);
  }

  async function copyWechat() {
    try {
      await navigator.clipboard.writeText(wechatId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      prompt("微信号", wechatId);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col bg-stone-50">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-amber-100 bg-white/95 px-3 py-3 backdrop-blur">
        <Link href="/messages" className="text-amber-800">
          ←
        </Link>
        {other && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={other.avatarUrl}
              alt={other.name}
              className="h-9 w-9 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{other.name}</p>
              <p className="text-[10px] text-stone-400">{t("wechatHint")}</p>
            </div>
          </>
        )}
        <LanguageToggle />
      </header>

      {wechatId && (
        <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-2">
          <button
            type="button"
            onClick={copyWechat}
            className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-emerald-100"
          >
            <span className="text-emerald-900">
              {t("wechat")}: <span className="font-mono font-semibold">{wechatId}</span>
            </span>
            <span className="font-medium text-emerald-700">
              {copied ? t("copied") : t("copyWechat")}
            </span>
          </button>
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.map((m) => {
          const mine = m.senderId === meId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  mine
                    ? "rounded-br-md bg-amber-600 text-white"
                    : "rounded-bl-md bg-white text-stone-800 shadow-sm ring-1 ring-stone-100"
                }`}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        className="sticky bottom-0 flex gap-2 border-t border-amber-100 bg-white p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("placeholder")}
          className="flex-1 rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="rounded-full bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t("send")}
        </button>
      </form>
    </main>
  );
}
