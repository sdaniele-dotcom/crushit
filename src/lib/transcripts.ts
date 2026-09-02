"use client";

import { getSupabase } from "@/lib/supabase";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ChatTranscript = {
  id: string;
  user_id: string | null;
  agent_name: string | null;
  agent_email: string | null;
  messages: ChatMessage[];
  turns: number;
  created_at: string;
  updated_at: string;
};

/** All AI chat transcripts, newest activity first (admins only, via RLS). */
export async function fetchTranscripts(limit = 200): Promise<ChatTranscript[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("chat_transcripts")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  return (data as ChatTranscript[]) ?? [];
}

/** Flatten a transcript to plain text for copy/download. */
export function transcriptToText(t: ChatTranscript): string {
  const head = [
    `Conversation ${t.id}`,
    t.agent_name || t.agent_email ? `Agent: ${[t.agent_name, t.agent_email].filter(Boolean).join(" · ")}` : "Anonymous visitor",
    `Started: ${new Date(t.created_at).toLocaleString("en-US")}`,
    `Last activity: ${new Date(t.updated_at).toLocaleString("en-US")}`,
    "",
  ].join("\n");
  const body = (t.messages ?? [])
    .map((m) => `${m.role === "user" ? "AGENT" : "ASSISTANT"}: ${m.content}`)
    .join("\n\n");
  return `${head}${body}\n`;
}
