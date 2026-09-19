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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-amber-100 ring-4 ring-amber-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        </div>
        <p className="text-lg font-semibold text-amber-900">{matchedLabel}</p>
        <p className="mt-1 text-stone-600">{name}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href={`/chat/${threadId}`}
            className="rounded-full bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-amber-700"
          >
            {openChatLabel}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-200 px-4 py-3 text-sm font-medium text-stone-600"
          >
            {keepLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
