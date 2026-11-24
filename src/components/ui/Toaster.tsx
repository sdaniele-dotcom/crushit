"use client";

import { useEffect, useState } from "react";
import { subscribeToasts, type ToastItem } from "@/lib/toast";

/** Renders Crush Stars / level toasts, bottom-right, auto-dismissing. */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToasts((t) => {
      setItems((cur) => [...cur, t]);
      setTimeout(() => {
        setItems((cur) => cur.filter((x) => x.id !== t.id));
      }, 4200);
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-crush-200 bg-white px-4 py-3 shadow-xl shadow-black/10"
          style={{ animation: "crush-toast-in .25s ease-out" }}
        >
          {/*
            The emoji is deliberately not rendered.

            Sixty-three call sites pass one — 📋, 📨, 📝, ⚠️ — and every toast
            in the suite opened with a 24px emoji whose shape depended on the
            visitor's operating system. Ignoring it here retires all of them
            at once, which is the only change that does not mean editing
            sixty-three files. The field is marked deprecated in lib/toast.ts;
            call sites can drop it as they are next touched.

            A toast is a title and a sentence. It does not need a picture.
          */}
          <div>
            <p className="text-sm font-bold text-ink-900">{t.title}</p>
            {t.body && <p className="text-xs text-muted">{t.body}</p>}
          </div>
        </div>
      ))}
      <style>{`@keyframes crush-toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
