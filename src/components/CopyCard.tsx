"use client";

import { useState } from "react";

export function CopyCard({
  title,
  meta,
  text,
}: {
  title: string;
  meta?: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-ink-900">{title}</h3>
          {meta && <p className="mt-0.5 text-xs text-muted">{meta}</p>}
        </div>
        <button
          type="button"
          onClick={copy}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            copied
              ? "bg-mint-500 text-white"
              : "bg-ink-900 text-white hover:bg-ink-800"
          }`}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 10l4 4 8-9" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="7" y="7" width="9" height="9" rx="1.5" />
                <path d="M4 13V5a1 1 0 0 1 1-1h8" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-800">
        {text}
      </pre>
    </div>
  );
}
