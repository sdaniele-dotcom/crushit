"use client";

import { useEffect, useState } from "react";
import { Container, PageHero } from "@/components/ui";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { uploadAgentImage } from "@/lib/storage";
import { awardStars, refreshProfileSoon } from "@/lib/rewards";
import { toast } from "@/lib/toast";
import { level_name } from "@/lib/levels";

type Form = {
  first_name: string;
  last_name: string;
  display_name: string;
  phone: string;
  brokerage: string;
  dre_license: string;
  instagram: string;
  website: string;
  market_city: string;
  headshot_url: string;
  brokerage_logo_url: string;
  team_logo_url: string;
  leaderboard_visible: boolean;
};

const empty: Form = {
  first_name: "", last_name: "", display_name: "", phone: "", brokerage: "",
  dre_license: "", instagram: "", website: "", market_city: "",
  headshot_url: "", brokerage_logo_url: "", team_logo_url: "", leaderboard_visible: true,
};

const input =
  "mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";
const label = "text-xs font-semibold uppercase tracking-wide text-muted";

function ImageField({
  title,
  round,
  url,
  kind,
  onChange,
}: {
  title: string;
  round?: boolean;
  url: string;
  kind: "headshot" | "brokerage_logo" | "team_logo";
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      onChange(await uploadAgentImage(file, kind));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <p className={label}>{title}</p>
      <div className="mt-1.5 flex items-center gap-4">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={title} className={`h-16 w-16 object-cover ${round ? "rounded-full" : "rounded-xl"} border border-border`} />
        ) : (
          <div className={`grid h-16 w-16 place-items-center bg-surface-2 text-xl text-muted ${round ? "rounded-full" : "rounded-xl"}`}>🖼️</div>
        )}
        <div className="flex flex-col gap-1">
          <input type="file" accept="image/*" onChange={pick} disabled={busy} className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-crush-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-crush-600" />
          {busy && <span className="text-xs text-muted">Uploading…</span>}
          {url && !busy && (
            <button type="button" onClick={() => onChange("")} className="self-start text-xs font-semibold text-muted underline">Remove</button>
          )}
          {err && <span className="text-xs text-crush-600">{err}</span>}
        </div>
      </div>
    </div>
  );
}

function ProfileInner() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        display_name: profile.display_name ?? "",
        phone: profile.phone ?? "",
        brokerage: profile.brokerage ?? "",
        dre_license: profile.dre_license ?? "",
        instagram: profile.instagram ?? "",
        website: profile.website ?? "",
        market_city: profile.market_city ?? "",
        headshot_url: profile.headshot_url ?? "",
        brokerage_logo_url: profile.brokerage_logo_url ?? "",
        team_logo_url: profile.team_logo_url ?? "",
        leaderboard_visible: profile.leaderboard_visible ?? true,
      });
    }
  }, [profile]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((s) => ({ ...s, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb || !user) return;
    setSaving(true);
    setSaved(false);
    const display = form.display_name.trim() || [form.first_name, form.last_name].filter(Boolean).join(" ").trim();
    const { error } = await sb
      .from("profiles")
      .update({ ...form, display_name: display })
      .eq("id", user.id);
    if (!error) {
      await refreshProfile();
      // Award the one-time "complete profile" bonus if all required fields are set.
      const res = await sb.rpc("mark_profile_complete");
      if ((res.data as { awarded?: boolean } | null)?.awarded) {
        toast({ emoji: "⭐", title: "+10 Crush Stars", body: "Profile complete!" });
        refreshProfileSoon();
      }
      void awardStars; // reserved for future explicit awards
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  }

  const created = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US") : "";

  return (
    <>
      <PageHero
        eyebrow="Your account"
        title={<>My <span className="text-gradient">Profile</span></>}
        subtitle="Enter your info once — Crushing It reuses it on your flyers, guides, and every tool."
      />
      <Container className="py-12">
        {/* Stars summary */}
        <div className="mb-8 flex flex-wrap items-center gap-6 rounded-3xl border border-crush-200 bg-gradient-to-br from-crush-50 to-white p-6">
          <div>
            <p className="text-3xl font-extrabold text-crush-600">⭐ {profile?.current_stars ?? 0}</p>
            <p className="text-xs text-muted">Crush Stars · {profile?.lifetime_stars ?? 0} lifetime</p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-ink-800">{level_name(profile?.lifetime_stars ?? 0)}</p>
            <p className="text-xs text-muted">{created && `Member since ${created}`}</p>
          </div>
        </div>

        <form onSubmit={save} className="grid gap-8 lg:grid-cols-2">
          {/* Left: details */}
          <div className="rounded-3xl border border-border bg-white p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><label className={label}>First name</label><input className={input} value={form.first_name} onChange={(e) => set("first_name", e.target.value)} /></div>
              <div><label className={label}>Last name</label><input className={input} value={form.last_name} onChange={(e) => set("last_name", e.target.value)} /></div>
              <div className="sm:col-span-2"><label className={label}>Display name</label><input className={input} value={form.display_name} onChange={(e) => set("display_name", e.target.value)} placeholder="How your name appears" /></div>
              <div className="sm:col-span-2"><label className={label}>Email</label><input className={`${input} opacity-60`} value={user?.email ?? ""} readOnly /></div>
              <div><label className={label}>Phone</label><input className={input} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(555) 123-4567" /></div>
              <div><label className={label}>DRE / License #</label><input className={input} value={form.dre_license} onChange={(e) => set("dre_license", e.target.value)} /></div>
              <div className="sm:col-span-2"><label className={label}>Brokerage / company</label><input className={input} value={form.brokerage} onChange={(e) => set("brokerage", e.target.value)} /></div>
              <div><label className={label}>Instagram</label><input className={input} value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@handle" /></div>
              <div><label className={label}>Website</label><input className={input} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" /></div>
              <div className="sm:col-span-2"><label className={label}>Preferred market / city</label><input className={input} value={form.market_city} onChange={(e) => set("market_city", e.target.value)} placeholder="Long Beach, CA" /></div>
            </div>
          </div>

          {/* Right: images + settings */}
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-border bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">Photos &amp; logos</h2>
              <div className="mt-4 grid gap-5">
                <ImageField title="Headshot" round url={form.headshot_url} kind="headshot" onChange={(u) => set("headshot_url", u)} />
                <ImageField title="Brokerage logo" url={form.brokerage_logo_url} kind="brokerage_logo" onChange={(u) => set("brokerage_logo_url", u)} />
                <ImageField title="Team / personal logo" url={form.team_logo_url} kind="team_logo" onChange={(u) => set("team_logo_url", u)} />
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">Privacy</h2>
              <label className="mt-3 flex items-center gap-3 text-sm text-ink-800">
                <input type="checkbox" className="h-4 w-4 accent-crush-500" checked={form.leaderboard_visible} onChange={(e) => set("leaderboard_visible", e.target.checked)} />
                Show me on the Crush Leaderboard
              </label>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-wrap items-center gap-4">
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-crush-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600 disabled:opacity-60">
              {saving ? "Saving…" : "Save profile"}
            </button>
            {saved && <span className="text-sm font-semibold text-mint-500">Saved ✓</span>}
            <p className="text-xs text-muted">Complete your profile (name, phone, brokerage, DRE, headshot) to earn +10 ⭐.</p>
          </div>
        </form>
      </Container>
    </>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}
