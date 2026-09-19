"use client";

import Link from "next/link";

function AvatarBlock({
  name,
  avatarUrl,
  side,
}: {
  name: string;
  avatarUrl?: string;
  side: "left" | "right";
}) {
  const initial = (name || "?").trim().charAt(0) || "?";
  const delay = side === "left" ? "0ms" : "60ms";

  return (
    <div
      className={`relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full shadow-card ring-[3px] ring-cream-50 ${
        side === "left" ? "z-10" : "z-20 -ml-4"
      }`}
      style={{ animation: `avatar-bounce 0.45s ease-out ${delay} both` }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center text-[22px] font-semibold text-cream-50 ${
            side === "left" ? "bg-teal" : "bg-ink"
          }`}
        >
          {initial}
        </div>
      )}
    </div>
  );
}

export default function MatchModal({
  myName,
  myAvatarUrl,
  name,
  avatarUrl,
  threadId,
  matchedLabel,
  openChatLabel,
  keepLabel,
  onClose,
}: {
  myName: string;
  myAvatarUrl?: string;
  name: string;
  avatarUrl?: string;
  threadId: string;
  matchedLabel: string;
  openChatLabel: string;
  keepLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-5 backdrop-blur-[6px] animate-fade-in">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[28px] bg-cream-50 p-7 text-center shadow-float animate-match-in">
        {/* Gold reserved for match moment only */}
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold-deep">
          Match
        </p>
        <div className="mx-auto mt-1 h-px w-10 bg-gold/50" />

        <div className="relative mx-auto mt-6 flex items-center justify-center">
          <AvatarBlock name={myName} avatarUrl={myAvatarUrl} side="left" />
          <AvatarBlock name={name} avatarUrl={avatarUrl} side="right" />
        </div>

        <p className="mt-6 text-[22px] font-semibold leading-[1.45] text-ink">{matchedLabel}</p>
        <p className="mt-1.5 text-[13px] leading-[1.45] text-ink-soft">
          {myName} · {name}
        </p>

        <div className="mt-7 flex flex-col gap-2.5">
          <Link
            href={`/chat/${threadId}`}
            className="pressable rounded-full bg-teal px-4 py-3.5 text-[15px] font-semibold text-cream-50 shadow-soft transition hover:bg-teal-deep"
          >
            {openChatLabel}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="pressable rounded-full px-4 py-3 text-[15px] font-medium text-ink-soft transition hover:bg-cream-200/60 hover:text-ink"
          >
            {keepLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
