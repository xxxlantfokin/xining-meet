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

type WeChatConsent = {
  wechatId: string | null;
  wechatOwner: "other" | "me" | null;
  state: "hidden" | "requested" | "approved";
  myRequestStatus: string;
  incomingPending: boolean;
  incomingStatus: string;
  iSharedMine: boolean;
  canRevokeOther: boolean;
  canRevokeMine: boolean;
};

const emptyConsent: WeChatConsent = {
  wechatId: null,
  wechatOwner: null,
  state: "hidden",
  myRequestStatus: "none",
  incomingPending: false,
  incomingStatus: "none",
  iSharedMine: false,
  canRevokeOther: false,
  canRevokeMine: false,
};

export default function ChatPage() {
  const { t } = useLang();
  const params = useParams();
  const threadId = params.threadId as string;
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [other, setOther] = useState<{ name: string; avatarUrl: string } | null>(null);
  const [consent, setConsent] = useState<WeChatConsent>(emptyConsent);
  const [meId, setMeId] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

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
    setConsent(data.wechat ?? emptyConsent);
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

  async function wechatAction(action: string, target?: string) {
    if (acting) return;
    setActing(true);
    try {
      const res = await fetch(`/api/threads/${threadId}/wechat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...(target ? { target } : {}) }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setConsent(data);
      if (action === "request") showToast(t("wechatRequestedToast"));
      if (action === "approve") showToast(t("wechatApprovedToast"));
      if (action === "deny") showToast(t("wechatDeferredToast"));
      if (action === "revoke") showToast(t("wechatRevokedToast"));
    } finally {
      setActing(false);
    }
  }

  async function copyWechat() {
    if (!consent.wechatId) return;
    try {
      await navigator.clipboard.writeText(consent.wechatId);
      showToast(`${t("copied")}: ${consent.wechatId}`);
    } catch {
      prompt(t("wechat"), consent.wechatId);
    }
  }

  const showCopy = consent.state === "approved" && !!consent.wechatId;

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="glass-panel sticky top-0 z-10 flex items-center gap-3 border-b border-cream-300/60 px-3 py-3 pt-safe">
        <Link
          href="/messages"
          className="pressable-sm flex h-10 w-10 items-center justify-center rounded-full bg-cream-50 text-ink shadow-soft"
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
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-semibold leading-[1.45] text-ink">
                {other.name}
              </p>
              <p className="text-[12px] leading-[1.45] text-ink-mute">{t("wechatChatHint")}</p>
            </div>
          </>
        )}
        <LanguageToggle />
      </header>

      {/* Incoming request: 同意 / 先聊聊 */}
      {consent.incomingPending && (
        <div className="border-b border-indigo/10 bg-indigo-mist/50 px-4 py-3">
          <p className="mb-2.5 text-[13px] leading-[1.45] text-ink-soft">{t("wechatIncoming")}</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={acting}
              onClick={() => wechatAction("approve")}
              className="pressable flex-1 rounded-full bg-teal py-2.5 text-[14px] font-semibold text-cream-50 shadow-soft disabled:opacity-50"
            >
              {t("wechatApprove")}
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => wechatAction("deny")}
              className="pressable flex-1 rounded-full bg-cream-50 py-2.5 text-[14px] font-semibold text-ink-soft ring-1 ring-cream-300 disabled:opacity-50"
            >
              {t("wechatDefer")}
            </button>
          </div>
        </div>
      )}

      {/* Approved: show ID + copy (only when wechatId present) */}
      {showCopy && (
        <div className="border-b border-teal/10 bg-teal-mist/40 px-4 py-2.5">
          <div className="flex w-full items-center justify-between gap-2 rounded-2xl bg-cream-50 px-3.5 py-2.5 text-[15px] shadow-soft">
            <button
              type="button"
              onClick={copyWechat}
              className="pressable min-w-0 flex-1 truncate text-left text-teal-deep"
            >
              {consent.wechatOwner === "me" ? t("wechatSharedMine") : t("wechat")}:{" "}
              <span className="font-mono font-semibold">{consent.wechatId}</span>
            </button>
            <button
              type="button"
              onClick={copyWechat}
              className="pressable shrink-0 rounded-full bg-teal px-3 py-1 text-[12px] font-semibold text-cream-50"
            >
              {t("copyWechat")}
            </button>
          </div>
          {(consent.canRevokeOther || consent.canRevokeMine) && (
            <button
              type="button"
              disabled={acting}
              onClick={() =>
                wechatAction(
                  "revoke",
                  consent.canRevokeOther ? "other" : "mine"
                )
              }
              className="mt-2 w-full text-center text-[12px] font-medium text-ink-mute underline-offset-2 hover:text-ink-soft hover:underline disabled:opacity-50"
            >
              {t("wechatRevoke")}
            </button>
          )}
        </div>
      )}

      {/* Request / waiting for OTHER's WeChat — no copy until approved */}
      {!consent.canRevokeOther && !consent.incomingPending && (
        <div className="border-b border-cream-300/50 bg-cream-100/60 px-4 py-2.5">
          {consent.myRequestStatus === "pending" || consent.state === "requested" ? (
            <p className="rounded-2xl bg-cream-50 px-3.5 py-2.5 text-center text-[13px] leading-[1.45] text-ink-soft shadow-soft">
              {t("wechatWaiting")}
            </p>
          ) : (
            <button
              type="button"
              disabled={acting}
              onClick={() => wechatAction("request")}
              className="pressable w-full rounded-2xl bg-cream-50 px-3.5 py-2.5 text-[14px] font-semibold text-indigo shadow-soft ring-1 ring-indigo/15 disabled:opacity-50"
            >
              {t("wechatRequest")}
            </button>
          )}
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
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-mist text-[18px] text-ink-soft">
              ✦
            </div>
            <p className="text-[16px] font-semibold text-ink">{t("chatEmpty")}</p>
            <p className="mt-1 text-[13px] leading-[1.45] text-ink-soft">{t("chatEmptyHint")}</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === meId;
            return (
              <div
                key={m.id}
                className={`flex animate-fade-up ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 text-[15px] leading-[1.5] shadow-soft ${
                    mine
                      ? "rounded-2xl rounded-br-md bg-ink text-cream-50"
                      : "rounded-2xl rounded-bl-md bg-cream-50 text-ink ring-1 ring-cream-300/70"
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
        className="glass-panel sticky bottom-0 flex gap-2 border-t border-cream-300/60 p-3 safe-pb"
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
          className="flex-1 rounded-full border-0 bg-cream-50 px-4 py-3 text-[15px] text-ink outline-none ring-1 ring-cream-300 placeholder:text-ink-mute focus:ring-2 focus:ring-teal/30"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="pressable rounded-full bg-teal px-5 py-3 text-[15px] font-semibold text-cream-50 shadow-soft disabled:opacity-40"
        >
          {t("send")}
        </button>
      </form>

      <Toast message={toast} visible={!!toast} />
    </main>
  );
}
