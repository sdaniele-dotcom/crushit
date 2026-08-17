"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! 👋 I'm the CRUSH IT assistant. Ask me anything about mortgages, loan programs, or how to use the tools on this site.",
};

const SUGGESTIONS = [
  "How much do I need for a down payment?",
  "What loan programs do you offer?",
  "How do I get pre-approved?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef<string>("");
  const sentCount = useRef(0);
  const messagesRef = useRef<Msg[]>(messages);
  messagesRef.current = messages;

  if (!sessionId.current && typeof crypto !== "undefined") {
    sessionId.current =
      crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  }

  // Email the full transcript to the team when the visitor closes the chat or
  // leaves the page — but only if there's something new since the last send.
  function sendTranscript() {
    const convo = messagesRef.current.filter((m) => m !== GREETING);
    if (convo.length <= sentCount.current) return;
    if (!convo.some((m) => m.role === "user")) return;
    sentCount.current = convo.length;
    try {
      fetch(`${site.flyerApiBase}/api/public/chat/transcript`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ session_id: sessionId.current, messages: convo }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") sendTranscript();
    };
    window.addEventListener("pagehide", sendTranscript);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", sendTranscript);
      document.removeEventListener("visibilitychange", onHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${site.flyerApiBase}/api/public/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Drop the canned greeting before sending; keep the real turns.
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      const data: { ok: boolean; reply?: string; error?: string } = await res.json();
      const reply =
        data.ok && data.reply
          ? data.reply
          : data.error ||
            "Sorry — I'm having trouble right now. Please call (562) 317-6112 or use the contact form.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I couldn't reach the assistant. Please check your connection, or reach us at (562) 317-6112.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => {
          if (open) sendTranscript();
          setOpen((o) => !o);
        }}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-crush-500 text-white shadow-xl shadow-crush-500/30 transition-transform hover:scale-105 hover:bg-crush-600"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[70vh] max-h-[560px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 bg-ink-900 px-5 py-4 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-crush-500 text-lg">
              💬
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold">CRUSH IT Assistant</p>
              <p className="text-xs text-slate-300">Mortgage &amp; homebuying help</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-crush-500 text-white"
                      : "border border-border bg-white text-ink-800"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl border border-border bg-white px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:-0.2s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:-0.1s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted" />
                </div>
              </div>
            )}

            {/* Suggestions (only before the first user turn) */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-crush-100 bg-crush-50 px-3 py-1.5 text-xs font-medium text-crush-700 transition-colors hover:bg-crush-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border bg-white px-3 py-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="flex-1 rounded-full border border-border bg-white px-4 py-2.5 text-sm text-ink-900 outline-none placeholder:text-muted focus:border-crush-400 focus:ring-2 focus:ring-crush-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-crush-500 text-white transition-colors hover:bg-crush-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>

          <p className="bg-white px-4 pb-3 text-center text-[10px] leading-tight text-muted">
            AI assistant — general info only, not a rate quote or approval. NMLS #{site.companyNmls}.
          </p>
        </div>
      )}
    </>
  );
}
