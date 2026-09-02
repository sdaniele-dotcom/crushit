"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { getSupabase } from "@/lib/supabase";
import { site } from "@/lib/site";
import { toast } from "@/lib/toast";

const input = "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";

function Inner() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  const loadCount = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { count } = await sb
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("email_opt_in", true)
      .not("email", "is", null);
    setCount(count ?? 0);
  }, []);
  useEffect(() => { loadCount(); }, [loadCount]);

  async function send() {
    const sb = getSupabase();
    if (!sb) return;
    setSending(true);
    setResult(null);
    const { data } = await sb.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setSending(false);
      toast({ emoji: "🔒", title: "Session expired", body: "Please log in again." });
      return;
    }
    try {
      const res = await fetch(`${site.flyerApiBase}/api/public/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      const d = await res.json().catch(() => ({ ok: false }));
      if (res.ok && d.ok) {
        setResult({ sent: d.sent ?? 0, failed: d.failed ?? 0, total: d.total ?? 0 });
        toast({ emoji: "📣", title: "Broadcast sent", body: `Delivered to ${d.sent} of ${d.total} agents.` });
        setConfirm(false);
      } else {
        toast({ emoji: "⚠️", title: "Couldn't send", body: (d.error as string) || "Please try again." });
      }
    } catch {
      toast({ emoji: "⚠️", title: "Couldn't reach the mail service", body: "Please try again in a moment." });
    } finally {
      setSending(false);
    }
  }

  const ready = subject.trim().length >= 2 && message.trim().length >= 2;

  return (
    <>
      <PageHero eyebrow="Admin" title={<>Agent <span className="text-gradient">newsletter</span></>} subtitle="Send a branded announcement to every opted-in agent. Each email includes a one-click unsubscribe." />
      <Container className="py-12">
        <Link href="/admin" className="text-sm font-semibold text-crush-600">← Admin overview</Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Subject</span>
              <input className={`${input} mt-1.5`} placeholder="August rate update 🎯" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={140} />
            </label>
            <label className="mt-4 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Message</span>
              <textarea className={`${input} mt-1.5 min-h-[220px]`} placeholder={"Hey {{first_name}},\n\nRates just moved — here's what it means for your buyers this week...\n\nBlank lines start a new paragraph."} value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
            <p className="mt-2 text-xs text-muted">
              Use <code className="rounded bg-surface-2 px-1">{"{{first_name}}"}</code> to personalize each email. Plain text — blank lines become paragraphs. The Crush logo, branding, and an unsubscribe link are added automatically.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {!confirm ? (
                <button type="button" disabled={!ready} onClick={() => setConfirm(true)} className="rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50">
                  Review &amp; send
                </button>
              ) : (
                <>
                  <button type="button" disabled={sending} onClick={send} className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-60">
                    {sending ? "Sending…" : `Send to ${count ?? "…"} agent${count === 1 ? "" : "s"} now`}
                  </button>
                  <button type="button" disabled={sending} onClick={() => setConfirm(false)} className="rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-surface-2">
                    Cancel
                  </button>
                </>
              )}
            </div>

            {result && (
              <p className="mt-4 rounded-xl border border-mint-500/30 bg-mint-500/10 px-4 py-3 text-sm font-semibold text-mint-700">
                Sent to {result.sent} of {result.total} agents{result.failed > 0 ? ` · ${result.failed} failed` : ""}.
              </p>
            )}
          </div>

          {/* Live preview */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Preview</p>
            <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-[#f5f4f2] p-4">
              <p className="mb-2 text-[11px] font-extrabold tracking-widest text-crush-600">CRUSH IT · AGENT SUITE</p>
              <div className="rounded-xl border border-border bg-white p-4">
                <p className="text-base font-bold text-ink-900">{subject.trim() || "Your subject appears here"}</p>
                <div className="mt-2 space-y-2 text-sm text-ink-800">
                  {(message.trim() || "Your message appears here. Use {{first_name}} to greet each agent by name.")
                    .replace(/\{\{\s*first_name\s*\}\}/gi, "Jane")
                    .split(/\n{2,}/)
                    .map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-muted">Crush Mortgage is your co-branded lending partner. <span className="underline">Unsubscribe</span> anytime.</p>
            </div>
            <p className="mt-3 text-xs text-muted">{count == null ? "Counting recipients…" : `${count} agent${count === 1 ? "" : "s"} opted in.`}</p>
          </div>
        </div>
      </Container>
    </>
  );
}

export default function AdminBroadcastPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
