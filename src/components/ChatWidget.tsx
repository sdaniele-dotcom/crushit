"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { useAuth } from "@/components/auth/AuthProvider";

type Action = { label: string; href: string };
type Msg = { role: "user" | "assistant"; content: string; actions?: Action[] };

/** "What are you working on?" starters — curated tool guidance (no AI call). */
const SCENARIOS: { label: string; reply: string; actions: Action[] }[] = [
  {
    label: "I have an open house",
    reply:
      "Love it. Here's your open house toolkit — a branded sign-in sheet, neighbor invites, and ready-to-send follow-ups. Add a co-branded flyer with financing scenarios to leave on the counter:",
    actions: [
      { label: "🏡 Open House Kit", href: "/co-marketing/open-house-kit" },
      { label: "🎨 Co-branded flyer", href: "/co-brand" },
      { label: "✉️ Follow-up emails", href: "/co-marketing/email-templates" },
    ],
  },
  {
    label: "I have a new listing",
    reply:
      "Let's make it shine. Start with a co-branded property flyer, then grab social posts and a quick video script to promote it:",
    actions: [
      { label: "🎨 Co-branded flyer", href: "/co-brand" },
      { label: "📱 Social media kit", href: "/co-marketing/social-kit" },
      { label: "🎬 Video scripts", href: "/co-marketing/video-scripts" },
    ],
  },
  {
    label: "I'm working with a buyer",
    reply:
      "Here's what helps a buyer feel confident and move fast — a co-branded guide, plus the numbers so there are no surprises:",
    actions: [
      { label: "📘 Buyer guide", href: "/resources" },
      { label: "🧮 Payment calculator", href: "/calculators" },
      { label: "🏠 Rent vs Own", href: "/rent-vs-own" },
      { label: "🏦 Loan programs", href: "/loan-programs" },
    ],
  },
  {
    label: "I have a listing appointment",
    reply:
      "Win the listing — hand them a polished, co-branded seller guide and show up looking buttoned-up:",
    actions: [
      { label: "📗 Seller guide", href: "/resources" },
      { label: "🎨 Co-branded flyer", href: "/co-brand" },
    ],
  },
  {
    label: "I want to make social content",
    reply:
      "Here's ready-to-post content and short scripts you can film in a few minutes — all brandable to you:",
    actions: [
      { label: "📱 Social media kit", href: "/co-marketing/social-kit" },
      { label: "🎬 Video scripts", href: "/co-marketing/video-scripts" },
    ],
  },
  {
    label: "Just have a question",
    reply: "Go for it — type your question below and I'll help. 👇",
    actions: [],
  },
];

export function ChatWidget() {
  const { profile } = useAuth();
  const firstName = profile?.first_name?.trim() || "";
  const agentName =
    (profile?.display_name?.trim() ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim()) ||
    "";

  const greeting: Msg = {
    role: "assistant",
    content: firstName
      ? `Hi ${firstName}! 👋 What are you working on today?`
      : "Hi! 👋 What are you working on today?",
  };

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([greeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the greeting personalized once the profile loads (before any chat).
  useEffect(() => {
    if (!started) setMessages([greeting]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function pickScenario(s: (typeof SCENARIOS)[number]) {
    setStarted(true);
    setMessages((m) => [
      ...m,
      { role: "user", content: s.label },
      { role: "assistant", content: s.reply, actions: s.actions.length ? s.actions : undefined },
    ]);
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setStarted(true);
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${site.flyerApiBase}/api/public/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: agentName || undefined,
          // Send only real chat turns (strip greeting + curated tool replies).
          messages: next
            .filter((m) => !m.actions && m !== greeting)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data: { ok: boolean; reply?: string; error?: string } = await res.json();
      const reply =
        data.ok && data.reply
          ? data.reply
          : data.error ||
            "Sorry — I'm having trouble right now. Please call (562) 317-6112.";
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

  const showScenarios = !started && !loading;

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
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
            <span className="grid h-9 w-9 place-items-center rounded-full bg-crush-500 text-lg">💬</span>
            <div className="leading-tight">
              <p className="text-sm font-bold">CRUSH IT Assistant</p>
              <p className="text-xs text-slate-300">Find the right tool, fast</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-crush-500 text-white" : "border border-border bg-white text-ink-800"
                  }`}
                >
                  {m.content}
                </div>
                {m.actions && m.actions.length > 0 && (
                  <div className="mt-2 flex max-w-[85%] flex-wrap gap-1.5">
                    {m.actions.map((a) => (
                      <Link
                        key={a.href + a.label}
                        href={a.href}
                        onClick={() => setOpen(false)}
                        className="rounded-full border border-crush-200 bg-crush-50 px-3 py-1.5 text-xs font-semibold text-crush-700 transition-colors hover:bg-crush-100"
                      >
                        {a.label}
                      </Link>
                    ))}
                  </div>
                )}
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

            {/* Scenario starters (before the first turn) */}
            {showScenarios && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => pickScenario(s)}
                    className="rounded-full border border-crush-100 bg-crush-50 px-3 py-1.5 text-xs font-medium text-crush-700 transition-colors hover:bg-crush-100"
                  >
                    {s.label}
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
              placeholder="Ask a question…"
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
