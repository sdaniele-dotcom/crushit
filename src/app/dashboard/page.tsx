"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { levelProgress } from "@/lib/levels";
import { useLevels } from "@/lib/useLevels";
import { listMyListings, listingLabel, type Listing } from "@/lib/listings";

function when(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-US");
}
function money(n: number | null) {
  return n == null ? "" : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

type Tx = { id: string; action: string; stars: number; description: string | null; created_at: string };
type Project = { id: string; kind: string; title: string | null; public_url: string | null; pdf_url: string | null; created_at: string };

const KIND_ICON: Record<string, string> = {
  property_flyer: "🎨", open_house_flyer: "🏡", buyer_guide: "📘",
  seller_guide: "📗", social: "📱", video: "🎬", open_house_kit: "🏡",
};

const QUICK_ACTIONS = [
  { label: "Create Listing Flyer", desc: "Co-branded property flyer", icon: "🎨", href: "/co-brand", tone: "from-crush-500 to-crush-600" },
  { label: "Build Open House Kit", desc: "Sign-in, invites & follow-ups", icon: "🏡", href: "/co-marketing/open-house-kit", tone: "from-ink-800 to-ink-900" },
  { label: "Run Buyer Payment", desc: "Mortgage & affordability", icon: "🧮", href: "/calculators", tone: "from-sky-500 to-sky-600" },
  { label: "Find a Loan Program", desc: "Match a buyer to a program", icon: "🏦", href: "/loan-programs", tone: "from-emerald-500 to-emerald-600" },
  { label: "Create Social Content", desc: "Posts, captions & scripts", icon: "📱", href: "/co-marketing/social-kit", tone: "from-violet-500 to-violet-600" },
  { label: "Buyer / Seller Guides", desc: "Co-branded client guides", icon: "📘", href: "/resources", tone: "from-amber-500 to-amber-600" },
];

function DashboardInner() {
  const { user, profile } = useAuth();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [price, setPrice] = useState("");
  const [down, setDown] = useState("");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !user) return;
    (async () => {
      const [t, p, l] = await Promise.all([
        sb.from("star_transactions").select("id,action,stars,description,created_at").order("created_at", { ascending: false }).limit(6),
        sb.from("saved_projects").select("id,kind,title,public_url,pdf_url,created_at").order("created_at", { ascending: false }).limit(6),
        listMyListings(),
      ]);
      setTxs((t.data as Tx[]) ?? []);
      setProjects((p.data as Project[]) ?? []);
      setListings(l);
    })();
  }, [user]);

  const levels = useLevels();
  const name = profile?.first_name || "there";
  const lifetime = profile?.lifetime_stars ?? 0;
  const lp = levelProgress(lifetime, levels);

  const scenarioHref = useMemo(() => {
    const p = parseInt(price.replace(/[^\d]/g, ""), 10);
    const params = new URLSearchParams();
    if (p) params.set("price", String(p));
    const d = parseFloat(down.replace(/[^\d.]/g, ""));
    if (d) params.set("downPct", String(d));
    const q = params.toString();
    return `/calculators${q ? `?${q}` : ""}`;
  }, [price, down]);

  return (
    <Container className="py-8 sm:py-10">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Welcome back, {name} 👋
          </h1>
          <p className="mt-1 text-muted">What are you working on today?</p>
        </div>
        <Link href="/profile" className="text-sm font-semibold text-crush-600 hover:text-crush-700">
          Edit profile →
        </Link>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href + a.label}
            href={a.href}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-lg"
          >
            <span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${a.tone} text-2xl text-white shadow-sm`} aria-hidden>
              {a.icon}
            </span>
            <div className="mt-4">
              <p className="font-bold text-ink-900">{a.label}</p>
              <p className="mt-0.5 text-xs text-muted">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Rent vs Own — full-width */}
      <Link
        href="/rent-vs-own"
        className="group mt-3 flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-lg sm:mt-4"
      >
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-2xl text-white shadow-sm" aria-hidden>🏠</span>
          <div>
            <p className="font-bold text-ink-900">Rent vs Own</p>
            <p className="mt-0.5 text-xs text-muted">Show buyers the math on renting vs. buying</p>
          </div>
        </div>
        <span className="text-crush-600 transition-transform group-hover:translate-x-1" aria-hidden>→</span>
      </Link>

      {/* Rewards summary */}
      <div className="mt-8 grid gap-4 rounded-2xl border border-crush-200 bg-gradient-to-br from-crush-50 to-white p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-8">
        <div>
          <p className="text-3xl font-extrabold text-crush-600">⭐ {profile?.current_stars ?? 0}</p>
          <p className="text-xs text-muted">Crush Points · {lifetime} lifetime</p>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-lg font-bold text-ink-900">{lp.current.name} 🔥</span>
            {lp.next ? (
              <span className="text-sm text-muted">{lp.starsToNext} until {lp.next.name}</span>
            ) : (
              <span className="text-sm font-semibold text-crush-600">Top tier 🏆</span>
            )}
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white/70 ring-1 ring-crush-100">
            <div className="h-full rounded-full bg-crush-500 transition-all" style={{ width: `${lp.pct}%` }} />
          </div>
          {txs[0] && (
            <p className="mt-2 text-xs text-muted">
              Latest: {txs[0].description || txs[0].action.replace(/_/g, " ")} ({txs[0].stars >= 0 ? "+" : ""}{txs[0].stars} ⭐)
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/rewards" className="rounded-full bg-crush-500 px-4 py-2 text-sm font-semibold text-white hover:bg-crush-600">Rewards</Link>
          <Link href="/leaderboard" className="rounded-full border border-crush-200 bg-white px-4 py-2 text-sm font-semibold text-crush-700 hover:bg-crush-50">Leaderboard</Link>
        </div>
      </div>

      {/* Main grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Left: projects + listings */}
        <div className="space-y-8 lg:col-span-2">
          {/* Recent projects */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">Recent projects</h2>
            </div>
            <div className="mt-3 space-y-2.5">
              {projects.length === 0 && (
                <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
                  Nothing yet — create a flyer, guide, or open house kit and it&apos;ll show up here.
                </p>
              )}
              {projects.map((p) => (
                <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4">
                  <span className="text-2xl" aria-hidden>{KIND_ICON[p.kind] ?? "📄"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">{p.title || p.kind.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted">{when(p.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {p.public_url && <a href={p.public_url} target="_blank" rel="noreferrer" className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-surface">Open</a>}
                    {p.pdf_url && <a href={p.pdf_url} target="_blank" rel="noreferrer" className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-surface">PDF</a>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* My listings */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">My listings</h2>
              <Link href="/listings" className="text-xs font-semibold text-crush-600 hover:text-crush-700">View all →</Link>
            </div>
            <div className="mt-3 space-y-2.5">
              {listings.length === 0 && (
                <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
                  No listings yet. <Link href="/listings" className="font-semibold text-crush-600">Add a property</Link> once and reuse it across every tool.
                </p>
              )}
              {listings.slice(0, 4).map((l) => (
                <div key={l.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">{listingLabel(l)}</p>
                    <p className="text-xs text-muted">
                      {[l.price ? money(l.price) : null, l.beds != null ? `${l.beds} bd` : null, l.baths != null ? `${l.baths} ba` : null].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <Link href={`/co-brand?listing=${l.id}`} className="rounded-full bg-crush-50 px-3 py-1.5 text-xs font-semibold text-crush-700 hover:bg-crush-100">Flyer</Link>
                    <Link href={`/co-marketing/open-house-kit?listing=${l.id}`} className="rounded-full bg-crush-50 px-3 py-1.5 text-xs font-semibold text-crush-700 hover:bg-crush-100">Open house</Link>
                    <Link href={`/co-marketing/social-kit?listing=${l.id}`} className="rounded-full bg-crush-50 px-3 py-1.5 text-xs font-semibold text-crush-700 hover:bg-crush-100">Social</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: quick buyer scenario + activity */}
        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">Quick buyer scenario</h2>
            <p className="mt-1 text-xs text-muted">Enter a price and down payment to jump into the payment calculator.</p>
            <div className="mt-3 space-y-2.5">
              <label className="block text-xs font-semibold text-muted">
                Purchase price
                <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$450,000"
                  className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100" />
              </label>
              <label className="block text-xs font-semibold text-muted">
                Down payment %
                <input inputMode="decimal" value={down} onChange={(e) => setDown(e.target.value)} placeholder="10"
                  className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100" />
              </label>
              <Link href={scenarioHref} className="block rounded-full bg-crush-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-crush-600">
                Run the numbers →
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">Recent activity</h2>
            <div className="mt-3 space-y-2">
              {txs.length === 0 && <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">Your Crush Points activity will appear here.</p>}
              {txs.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{t.description || t.action.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted">{when(t.created_at)}</p>
                  </div>
                  <span className={`shrink-0 text-sm font-bold ${t.stars >= 0 ? "text-crush-600" : "text-muted"}`}>
                    {t.stars >= 0 ? "+" : ""}{t.stars} ⭐
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
