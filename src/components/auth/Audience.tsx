"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * One page, two audiences.
 *
 * Several pages — loan programs, calculators, down-payment help — are useful
 * to a buyer AND to an agent, and they were written entirely for the agent:
 * "use these to answer buyer questions", "get your buyer pre-approved", a
 * download button for a co-branded flyer. A buyer arriving from the public nav
 * landed on a page addressed to somebody else.
 *
 * The fix is not two copies of each page, which drift. It is to write the page
 * for the BUYER — the public audience — and wrap the agent's extras in
 * <AgentOnly>, which renders nothing until somebody is signed in. An agent
 * loses nothing: they still get the flyer button, and the consumer wording is
 * what they would say to a client anyway.
 *
 * STATIC EXPORT, SO THIS IS CLIENT-SIDE. There is no server to vary the HTML
 * by session, which means the agent's extras are in the shipped bundle and
 * appear a moment after hydration. That is fine for affordances — a button, a
 * paragraph of explanation — and would NOT be fine for anything secret. Do not
 * put privileged data inside these.
 */
export function AgentOnly({ children }: { children: ReactNode }) {
  const { configured, user } = useAuth();
  if (!configured || !user) return null;
  return <>{children}</>;
}

/** The mirror: shown only to a logged-out visitor, i.e. the public. */
export function ConsumerOnly({ children }: { children: ReactNode }) {
  const { configured, user } = useAuth();
  if (configured && user) return null;
  return <>{children}</>;
}
