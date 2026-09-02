"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { fetchTranscripts, transcriptToText, type ChatTranscript } from "@/lib/transcripts";
import { toast } from "@/lib/toast";

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function Inner() {
  const [rows, setRows] = useState<ChatTranscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setRows(await fetchTranscripts());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((t) =>
      [t.agent_name, t.agent_email, ...(t.messages ?? []).map((m) => m.content)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [rows, q]);

  function copy(t: ChatTranscript) {
    navigator.clipboard?.writeText(transcriptToText(t)).then(
      () => toast({ emoji: "📋", title: "Copied", body: "Transcript copied to your clipboard." }),
      () => toast({ emoji: "⚠️", title: "Couldn't copy", body: "Select and copy manually." }),
    );
  }

  function downloadAll() {
    const text = filtered.map(transcriptToText).join("\n" + "=".repeat(60) + "\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crush-chat-transcripts-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHero eyebrow="Admin" title={<>Chat <span className="text-gradient">transcripts</span></>} subtitle="Every conversation agents and visitors have with the AI assistant." />
      <Container className="py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin" className="text-sm font-semibold text-crush-600">← Admin overview</Link>
          <div className="flex flex-wrap items-center gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transcripts…" className="rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-crush-400" />
            <button type="button" onClick={downloadAll} disabled={filtered.length === 0} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-surface-2 disabled:opacity-50">Download all (.txt)</button>
          </div>
        </div>

        {loading && <div className="flex justify-center py-16"><span className="h-8 w-8 animate-spin rounded-full border-2 border-crush-500 border-t-transparent" /></div>}
        {!loading && rows.length === 0 && (
          <p className="mt-6 rounded-2xl border border-border bg-surface p-6 text-sm text-muted">No chat transcripts yet. They appear here once agents start using the assistant.</p>
        )}

        <div className="mt-6 space-y-3">
          {filtered.map((t) => {
            const open = openId === t.id;
            const preview = (t.messages ?? []).find((m) => m.role === "user")?.content ?? "";
            return (
              <div key={t.id} className="rounded-2xl border border-border bg-white">
                <button type="button" onClick={() => setOpenId(open ? null : t.id)} className="flex w-full items-start justify-between gap-4 p-5 text-left">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900">{t.agent_name || t.agent_email || "Anonymous visitor"}</p>
                    <p className="truncate text-sm text-muted">{preview || "—"}</p>
                    <p className="mt-1 text-xs text-muted">{t.turns} message{t.turns === 1 ? "" : "s"} · {fmt(t.updated_at)}{t.agent_email ? ` · ${t.agent_email}` : ""}</p>
                  </div>
                  <span className="shrink-0 text-crush-600">{open ? "▲" : "▼"}</span>
                </button>
                {open && (
                  <div className="border-t border-border p-5">
                    <div className="space-y-3">
                      {(t.messages ?? []).map((m, i) => (
                        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-crush-500 text-white" : "border border-border bg-surface text-ink-800"}`}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button type="button" onClick={() => copy(t)} className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-surface-2">Copy transcript</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </>
  );
}

export default function AdminChatTranscriptsPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
