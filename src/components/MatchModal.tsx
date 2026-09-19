"use client";

import Link from "next/link";

export default function MatchModal({
  name,
  avatarUrl,
  threadId,
  matchedLabel,
  openChatLabel,
  keepLabel,
  onClose,
}: {
  name: string;
  avatarUrl: string;
  threadId: string;
  matchedLabel: string;
  openChatLabel: string;
  keepLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-deep/50 p-5 backdrop-blur-sm animate-fade-in">
      <div className="match-sparkle relative w-full max-w-sm overflow-hidden rounded-4xl bg-cream-50 p-7 text-center shadow-float animate-match-burst">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-turquoise/10" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-gold/15" />

        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
          ✦ Match ✦
        </p>

        <div className="relative mx-auto mt-4 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-turquoise/30 to-gold/40 animate-pulse-soft" />
          <div className="relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-white shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          </div>
        </div>

        <p className="relative mt-5 text-lg font-bold text-indigo-deep">{matchedLabel}</p>
        <p className="relative mt-1 text-sm text-indigo-soft">{name}</p>

        <div className="relative mt-7 flex flex-col gap-2.5">
          <Link
            href={`/chat/${threadId}`}
            className="pressable rounded-full bg-turquoise px-4 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-turquoise-deep"
          >
            {openChatLabel}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="pressable rounded-full border border-cream-300 bg-white px-4 py-3 text-sm font-medium text-indigo-soft transition hover:border-indigo-mist hover:text-indigo-deep"
          >
            {keepLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
