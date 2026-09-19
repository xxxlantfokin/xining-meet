"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UserCard = {
  id: string;
  name: string;
  gender: string;
  age: number;
  city: string;
  bio: string;
  avatarUrl: string;
};

type Dir = "like" | "pass";

export default function SwipeCard({
  user,
  ageLabel,
  maleLabel,
  femaleLabel,
  exitDir,
  onSwipe,
  disabled,
}: {
  user: UserCard;
  ageLabel: string;
  maleLabel: string;
  femaleLabel: string;
  exitDir?: Dir | null;
  onSwipe?: (dir: Dir) => void;
  disabled?: boolean;
}) {
  const genderLabel = user.gender === "male" ? maleLabel : femaleLabel;
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const dragRef = useRef({ x: 0, y: 0 });
  const firedRef = useRef(false);
  const [drag, setDrag] = useState({ x: 0, y: 0, dragging: false });
  const [localExit, setLocalExit] = useState<Dir | null>(null);

  const leaving = localExit ?? exitDir ?? null;

  useEffect(() => {
    firedRef.current = false;
    setLocalExit(null);
    setDrag({ x: 0, y: 0, dragging: false });
    dragRef.current = { x: 0, y: 0 };
  }, [user.id]);

  useEffect(() => {
    if (exitDir && !localExit) {
      setLocalExit(exitDir);
      setDrag({
        x: exitDir === "like" ? 520 : -520,
        y: 40,
        dragging: false,
      });
    }
  }, [exitDir, localExit]);

  const commit = useCallback(
    (dir: Dir) => {
      if (firedRef.current || disabled) return;
      firedRef.current = true;
      setLocalExit(dir);
      setDrag({ x: dir === "like" ? 520 : -520, y: dragRef.current.y, dragging: false });
      onSwipe?.(dir);
    },
    [disabled, onSwipe]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || leaving || firedRef.current) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      startRef.current = { x: e.clientX, y: e.clientY };
      dragRef.current = { x: 0, y: 0 };
      setDrag({ x: 0, y: 0, dragging: true });
    },
    [disabled, leaving]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!startRef.current || leaving || firedRef.current) return;
      const dx = e.clientX - startRef.current.x;
      const dy = (e.clientY - startRef.current.y) * 0.25;
      dragRef.current = { x: dx, y: dy };
      setDrag({ x: dx, y: dy, dragging: true });
    },
    [leaving]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!startRef.current) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      const dx = dragRef.current.x;
      startRef.current = null;
      if (Math.abs(dx) >= 90) {
        commit(dx > 0 ? "like" : "pass");
        return;
      }
      setDrag({ x: 0, y: 0, dragging: false });
      dragRef.current = { x: 0, y: 0 };
    },
    [commit]
  );

  const rot = drag.x / 16;
  const likeOpacity = leaving === "like" ? 1 : Math.min(1, Math.max(0, drag.x / 70));
  const passOpacity = leaving === "pass" ? 1 : Math.min(1, Math.max(0, -drag.x / 70));

  return (
    <div
      className="relative flex h-full w-full touch-none select-none flex-col overflow-hidden rounded-4xl bg-white shadow-card ring-1 ring-cream-300/80 will-change-transform"
      style={{
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rot}deg)`,
        opacity: leaving ? 0.35 : 1,
        transition: drag.dragging
          ? "none"
          : "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="relative min-h-0 flex-1 bg-gradient-to-br from-indigo-mist via-cream-100 to-turquoise-mist">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
          draggable={false}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-indigo-deep/90 via-indigo-deep/45 to-transparent p-5 pt-20 text-white">
          <h2 className="text-2xl font-bold tracking-tight">
            {user.name}
            <span className="ml-2 text-lg font-medium text-cream-200">
              {user.age}
              {ageLabel}
            </span>
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-cream-200/90">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-turquoise-soft" />
            {user.city} · {genderLabel}
          </p>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-cream-100/95">
            {user.bio}
          </p>
        </div>

        <div
          className="pointer-events-none absolute left-5 top-8 rotate-[-18deg] rounded-xl border-4 border-turquoise px-3 py-1 text-xl font-black uppercase tracking-widest text-turquoise"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </div>
        <div
          className="pointer-events-none absolute right-5 top-8 rotate-[18deg] rounded-xl border-4 border-rose-400 px-3 py-1 text-xl font-black uppercase tracking-widest text-rose-400"
          style={{ opacity: passOpacity }}
        >
          PASS
        </div>
      </div>
    </div>
  );
}
