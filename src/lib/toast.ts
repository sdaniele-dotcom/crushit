"use client";

/** Tiny global toast bus (no provider needed). */
export type ToastItem = {
  id: string;
  title: string;
  body?: string;
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
