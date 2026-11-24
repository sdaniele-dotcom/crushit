"use client";

/** Tiny global toast bus (no provider needed). */
export type ToastItem = {
  id: string;
  title: string;
  body?: string;
  /**
   * @deprecated Not rendered. Toaster stopped showing these — a toast is a
   * title and a sentence, and an emoji's shape depended on the viewer's OS.
   * Drop the argument when you next touch a call site; passing it is a no-op.
   */
  emoji?: string;
};

type Listener = (t: ToastItem) => void;
const listeners = new Set<Listener>();

export function toast(t: Omit<ToastItem, "id">) {
  const item: ToastItem = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ...t };
  listeners.forEach((l) => l(item));
}

export function subscribeToasts(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
