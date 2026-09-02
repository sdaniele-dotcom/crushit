"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { fullName } from "@/lib/profile";
import { site } from "@/lib/site";
import { toast } from "@/lib/toast";
import { fetchEmailTemplates, saveEmailTemplate, TEMPLATE_META, type EmailTemplate } from "@/lib/emailTemplates";

/** One-click diagnostic: hits the welcome endpoint directly (needs only the
 *  Resend key) and shows the raw result, so it's obvious what's configured. */
function WelcomeTest() {
  const { user, profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>("");
  const email = profile?.email ?? user?.email ?? "";

  async function run() {
    if (!email) { setResult("No email on your account."); return; }
    setBusy(true);
    setResult("");
    try {
      const res = await fetch(`${site.flyerApiBase}/api/public/welcome-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: fullName(profile) || undefined }),
      });
      const d = await res.json().catch(() => ({}));
      if (d.skipped === "email_not_configured") {
        setResult("⚠️ RESEND_API_KEY isn't active in the backend yet — add it in Vercel and redeploy. (This is the blocker.)");
      } else if (res.ok && d.ok && (d.outcome === "sent" || d.outcome === undefined)) {
        setResult(`✅ Sent to ${email}. Check your inbox (and spam). If it lands, the email system works — any signup issue is just the trigger.`);
      } else if (res.ok && d.ok && d.outcome === "skipped") {
        setResult(`ℹ️ Skipped (already welcomed, or no matching profile). Sent nothing. Raw: ${JSON.stringify(d)}`);
      } else {
        setResult(`❌ ${d.error || "Send failed"} · Raw: ${JSON.stringify(d)} (HTTP ${res.status})`);
      }
    } catch (e) {
      setResult(`❌ Couldn't reach the backend: ${e instanceof Error ? e.message : "network error"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-crush-200 bg-crush-50 p-5">
      <h2 className="text-base font-bold text-ink-900">Test the email system</h2>
      <p className="mt-0.5 text-sm text-muted">Sends a real welcome email to <span className="font-medium">{email || "your account"}</span> right now. Isolates the mail setup from the signup flow.</p>
      <button type="button" onClick={run} disabled={busy} className="mt-3 rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50">
        {busy ? "Sending…" : "Send a welcome email to me"}
      </button>
      {result && <p className="mt-3 rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink-800">{result}</p>}
    </div>
  );
}

const input = "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";

function Editor({ tpl, onSaved }: { tpl: EmailTemplate; onSaved: () => void }) {
  const meta = TEMPLATE_META[tpl.key] ?? { title: tpl.key, blurb: "", tokens: [], defaultSubject: "" };
  const [subject, setSubject] = useState(tpl.subject);
  const [body, setBody] = useState(tpl.body);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  async function save() {
    setSaving(true);
    const ok = await saveEmailTemplate(tpl.key, subject.trim(), body);
    setSaving(false);
    if (ok) { toast({ emoji: "💾", title: "Saved", body: `“${meta.title}” updated.` }); onSaved(); }
    else toast({ emoji: "⚠️", title: "Save failed", body: "Check your admin access and try again." });
  }

  async function sendTest() {
    if (body.trim().length < 2) { toast({ emoji: "✍️", title: "Add body text", body: "Type a custom body to send a test. Blank uses the built-in design automatically on real sends." }); return; }
    setSending(true);
    const sb = getSupabase();
    const { data } = (await sb?.auth.getSession()) ?? { data: { session: null } };
    const token = data.session?.access_token;
    if (!token) { setSending(false); toast({ emoji: "🔒", title: "Session expired", body: "Log in again." }); return; }
    try {
      const res = await fetch(`${site.flyerApiBase}/api/public/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject: subject.trim() || meta.defaultSubject, message: body, test: true }),
      });
      const d = await res.json().catch(() => ({ ok: false }));
      if (res.ok && d.ok) toast({ emoji: "📨", title: "Test sent", body: `Check ${d.to || "your inbox"}.` });
      else toast({ emoji: "⚠️", title: "Couldn't send test", body: (d.error as string) || "Try again." });
    } catch { toast({ emoji: "⚠️", title: "Couldn't reach the mail service", body: "Try again." }); }
    finally { setSending(false); }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-ink-900">{meta.title}</h2>
        {tpl.updated_at && <span className="text-xs text-muted">Updated {new Date(tpl.updated_at).toLocaleDateString("en-US")}</span>}
      </div>
      <p className="mt-0.5 text-sm text-muted">{meta.blurb}</p>

      <label className="mt-4 block">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Subject</span>
        <input className={`${input} mt-1.5`} placeholder={meta.defaultSubject} value={subject} onChange={(e) => setSubject(e.target.value)} />
        <span className="mt-1 block text-xs text-muted">Blank = built-in default: <span className="font-medium">{meta.defaultSubject}</span></span>
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Body</span>
        <textarea className={`${input} mt-1.5 min-h-[200px] font-mono text-[13px]`} placeholder="Leave blank to use the built-in designed layout. Type here to fully override the wording." value={body} onChange={(e) => setBody(e.target.value)} />
      </label>
      <p className="mt-2 text-xs text-muted">
        Blank body keeps the designed layout. Formatting: blank line = new paragraph, lines starting with <code className="rounded bg-surface-2 px-1">-</code> or <code className="rounded bg-surface-2 px-1">•</code> = bullets, <code className="rounded bg-surface-2 px-1">**bold**</code>. Placeholders:{" "}
        {meta.tokens.map((t) => <code key={t} className="mr-1 rounded bg-surface-2 px-1">{`{{${t}}}`}</code>)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={save} disabled={saving} className="rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
        <button type="button" onClick={sendTest} disabled={sending} className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-surface-2 disabled:opacity-50">{sending ? "Sending…" : "Send test to me"}</button>
      </div>
    </div>
  );
}

function Inner() {
  const [rows, setRows] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setRows(await fetchEmailTemplates());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <>
      <PageHero eyebrow="Admin" title={<>Email <span className="text-gradient">templates</span></>} subtitle="Edit the automated agent emails. Leave a field blank to keep the built-in designed default." />
      <Container className="py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin" className="text-sm font-semibold text-crush-600">← Admin overview</Link>
          <Link href="/admin/broadcast" className="text-sm font-semibold text-crush-600">Send a newsletter →</Link>
        </div>

        <div className="mt-6"><WelcomeTest /></div>

        {loading && <div className="flex justify-center py-16"><span className="h-8 w-8 animate-spin rounded-full border-2 border-crush-500 border-t-transparent" /></div>}
        {!loading && rows.length === 0 && (
          <p className="mt-6 rounded-2xl border border-border bg-surface p-6 text-sm text-muted">No templates found. Run migration 0039_email_templates.sql to create them.</p>
        )}

        <div className="mt-6 space-y-6">
          {rows.map((t) => <Editor key={t.key} tpl={t} onSaved={load} />)}
        </div>
      </Container>
    </>
  );
}

export default function AdminEmailTemplatesPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
