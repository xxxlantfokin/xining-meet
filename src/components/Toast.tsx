"use client";

export default function Toast({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 animate-toast-in"
      role="status"
    >
      <div className="rounded-full bg-indigo-deep/95 px-5 py-2.5 text-sm font-medium text-cream-50 shadow-float backdrop-blur">
        {message}
      </div>
    </div>
  );
}
