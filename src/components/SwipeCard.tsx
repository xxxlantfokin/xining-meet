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
  hometown?: string;
  dialect?: string;
};

type Dir = "like" | "pass";

const THRESHOLD = 100;
const VELOCITY = 0.5; // px/ms
const EXIT_MS = 260;

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
    const rot = x / 28;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
    el.style.transition = dragging
      ? "none"
      : leaving
        ? `transform ${EXIT_MS}ms ease-out`
        : "transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.opacity = "1";
    const likeO = Math.min(1, Math.max(0, x / 90));
    const passO = Math.min(1, Math.max(0, -x / 90));
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
      const flyX = dir === "like" ? window.innerWidth * 1.2 : -window.innerWidth * 1.2;
      const flyY = fromY + (dir === "like" ? 28 : 40);
      paint(fromX, fromY, true, false);
      requestAnimationFrame(() => {
        paint(flyX, flyY, false, true);
        if (likeStampRef.current) likeStampRef.current.style.opacity = dir === "like" ? "1" : "0";
        if (passStampRef.current) passStampRef.current.style.opacity = dir === "pass" ? "1" : "0";
      });
      onSwipe?.(dir);
    },
    [disabled, onSwipe, paint]
  );

  useEffect(() => {
    if (!exitDir || firedRef.current) return;
    const { x, y } = posRef.current;
    commit(exitDir, x || (exitDir === "like" ? 36 : -36), y || 16);
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
      const abs = Math.abs(rawX);
      const rubber = abs <= THRESHOLD ? rawX : Math.sign(rawX) * (THRESHOLD + (abs - THRESHOLD) * 0.32);
      const y = rawY * 0.18;
      const now = performance.now();
      posRef.current = { x: rubber, y };
      lastMoveRef.current = { x: e.clientX, t: now };
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
      const now = performance.now();
      let vx = 0;
      if (last && startRef.current) {
        const sampleAge = now - last.t;
        if (sampleAge < 80) {
          vx = (last.x - startRef.current.x) / Math.max(16, last.t - startRef.current.t);
        }
      }
      startRef.current = null;

      const fast = Math.abs(vx) >= VELOCITY;
      const far = Math.abs(x) >= THRESHOLD;
      if ((far || fast) && (Math.abs(x) > 20 || Math.abs(vx) >= VELOCITY * 0.85)) {
        const dir: Dir = fast ? (vx > 0 ? "like" : "pass") : x > 0 ? "like" : "pass";
        commit(dir, x, y);
        return;
      }
      posRef.current = { x: 0, y: 0 };
      paint(0, 0, false, false);
    },
    [commit, paint]
  );

  const meta = [
    user.city,
    user.hometown,
    user.dialect,
    genderLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      ref={cardRef}
      className="relative flex h-full w-full touch-none select-none flex-col overflow-hidden rounded-[28px] bg-cream-50 shadow-card will-change-transform"
      style={{ transform: "translate3d(0,0,0)", touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="relative min-h-0 flex-1 bg-ink-mist">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
          draggable={false}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent px-5 pb-6 pt-24 text-cream-50">
          <h2 className="text-[22px] font-semibold leading-[1.45] tracking-tight">
            {user.name}
            <span className="ml-2 text-[16px] font-medium text-cream-200">
              {user.age}
              {ageLabel}
            </span>
          </h2>
          <p className="mt-1.5 text-[13px] leading-[1.45] text-cream-200/90">{meta}</p>
          <p className="mt-3 line-clamp-3 text-[15px] leading-[1.5] text-cream-100/95">{user.bio}</p>
        </div>

        <div
          ref={likeStampRef}
          className="pointer-events-none absolute left-5 top-7 rotate-[-14deg] rounded-xl border-[3px] border-teal px-3 py-1 text-[15px] font-semibold tracking-[0.14em] text-teal"
          style={{ opacity: 0 }}
        >
          LIKE
        </div>
        <div
          ref={passStampRef}
          className="pointer-events-none absolute right-5 top-7 rotate-[14deg] rounded-xl border-[3px] border-ink-mute px-3 py-1 text-[15px] font-semibold tracking-[0.14em] text-ink-mute"
          style={{ opacity: 0 }}
        >
          PASS
        </div>
      </div>
    </div>
  );
}
