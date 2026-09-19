"use client";

import { useCallback, useEffect, useRef } from "react";

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

const THRESHOLD = 110;
const VELOCITY = 0.55; // px/ms

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
  const cardRef = useRef<HTMLDivElement>(null);
  const likeStampRef = useRef<HTMLDivElement>(null);
  const passStampRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const lastMoveRef = useRef<{ x: number; t: number } | null>(null);
  const firedRef = useRef(false);
  const draggingRef = useRef(false);
  const rafRef = useRef(0);

  const paint = useCallback((x: number, y: number, dragging: boolean, leaving: boolean) => {
    const el = cardRef.current;
    if (!el) return;
    const rot = x / 22;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
    el.style.transition = dragging
      ? "none"
      : leaving
        ? "transform 0.42s cubic-bezier(0.2, 0.8, 0.2, 1)"
        : "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
    el.style.opacity = "1";
    const likeO = Math.min(1, Math.max(0, x / 80));
    const passO = Math.min(1, Math.max(0, -x / 80));
    if (likeStampRef.current) likeStampRef.current.style.opacity = String(likeO);
    if (passStampRef.current) passStampRef.current.style.opacity = String(passO);
  }, []);

  useEffect(() => {
    firedRef.current = false;
    draggingRef.current = false;
    posRef.current = { x: 0, y: 0 };
    startRef.current = null;
    lastMoveRef.current = null;
    paint(0, 0, false, false);
  }, [user.id, paint]);

  const commit = useCallback(
    (dir: Dir, fromX: number, fromY: number) => {
      if (firedRef.current || disabled) return;
      firedRef.current = true;
      draggingRef.current = false;
      const flyX = dir === "like" ? window.innerWidth * 1.15 : -window.innerWidth * 1.15;
      const flyY = fromY + (dir === "like" ? 40 : 60);
      paint(fromX, fromY, true, false);
      // next frame start fling transition
      requestAnimationFrame(() => {
        paint(flyX, flyY, false, true);
        if (likeStampRef.current) likeStampRef.current.style.opacity = dir === "like" ? "1" : "0";
        if (passStampRef.current) passStampRef.current.style.opacity = dir === "pass" ? "1" : "0";
      });
      onSwipe?.(dir);
    },
    [disabled, onSwipe, paint]
  );

  // Button-driven exit from parent
  useEffect(() => {
    if (!exitDir || firedRef.current) return;
    const { x, y } = posRef.current;
    commit(exitDir, x || (exitDir === "like" ? 40 : -40), y || 20);
  }, [exitDir, commit]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || firedRef.current) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      draggingRef.current = true;
      startRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      lastMoveRef.current = { x: e.clientX, t: performance.now() };
      posRef.current = { x: 0, y: 0 };
      paint(0, 0, true, false);
    },
    [disabled, paint]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!startRef.current || !draggingRef.current || firedRef.current) return;
      const rawX = e.clientX - startRef.current.x;
      const rawY = e.clientY - startRef.current.y;
      // rubber-band: ease beyond threshold
      const abs = Math.abs(rawX);
      const rubber = abs <= THRESHOLD ? rawX : Math.sign(rawX) * (THRESHOLD + (abs - THRESHOLD) * 0.35);
      const y = rawY * 0.22;
      posRef.current = { x: rubber, y };
      lastMoveRef.current = { x: e.clientX, t: performance.now() };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => paint(rubber, y, true, false));
    },
    [paint]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!startRef.current) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      draggingRef.current = false;
      const { x, y } = posRef.current;
      const last = lastMoveRef.current;
      const dt = last ? Math.max(1, performance.now() - last.t) : 16;
      // approximate velocity from last segment vs start
      const vx =
        last && startRef.current
          ? (last.x - startRef.current.x) / Math.max(1, last.t - startRef.current.t)
          : 0;
      startRef.current = null;

      const fast = Math.abs(vx) >= VELOCITY;
      const far = Math.abs(x) >= THRESHOLD;
      if ((far || fast) && (Math.abs(x) > 24 || fast)) {
        const dir: Dir = fast ? (vx > 0 ? "like" : "pass") : (x > 0 ? "like" : "pass");
        commit(dir, x, y);
        return;
      }
      // spring back
      posRef.current = { x: 0, y: 0 };
      paint(0, 0, false, false);
    },
    [commit, paint]
  );

  return (
    <div
      ref={cardRef}
      className="relative flex h-full w-full touch-none select-none flex-col overflow-hidden rounded-4xl bg-white shadow-card ring-1 ring-cream-300/80 will-change-transform"
      style={{ transform: "translate3d(0,0,0)", touchAction: "none" }}
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
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-cream-100/95">{user.bio}</p>
        </div>

        <div
          ref={likeStampRef}
          className="pointer-events-none absolute left-5 top-8 rotate-[-18deg] rounded-xl border-4 border-turquoise px-3 py-1 text-xl font-black uppercase tracking-widest text-turquoise"
          style={{ opacity: 0 }}
        >
          LIKE
        </div>
        <div
          ref={passStampRef}
          className="pointer-events-none absolute right-5 top-8 rotate-[18deg] rounded-xl border-4 border-rose-400 px-3 py-1 text-xl font-black uppercase tracking-widest text-rose-400"
          style={{ opacity: 0 }}
        >
          PASS
        </div>
      </div>
    </div>
  );
}
