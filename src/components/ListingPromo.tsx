"use client";

import { useEffect, useState } from "react";
import { useActiveListing } from "@/components/ActiveListing";
import { useAuth } from "@/components/auth/AuthProvider";
import { fullName } from "@/lib/profile";
import { listingLabel } from "@/lib/listings";
import { submitPromotionRequest } from "@/lib/promotions";
import { uploadPromoVideo } from "@/lib/storage";
import { toast } from "@/lib/toast";

const inp =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";
const lbl = "text-xs font-semibold uppercase tracking-wide text-muted";

/** What the agent can ask us to weave into the post — their listing stays the star. */
const INCLUDE_OPTIONS: [string, string][] = [
  ["listing_photos", "Listing photos"],
  ["property_info", "Property details (beds / baths / price)"],
  ["payment_scenarios", "Sample monthly-payment scenarios"],
  ["mortgage_flyer", "Co-branded financing flyer"],
  ["walkthrough_video", "My walkthrough video"],
  ["my_branding", "My photo, logo & contact info"],
];

/**
 * The listing-promotion opt-in + request flow. An agent toggles "promote my
 * listings," and we auto-fill the property from the shared Lofty listing they
 * already picked. The request lands in our admin queue; our team builds the
 * Instagram content as a collab so the agent stays front-and-center — we never
 * take their leads.
 */
export function ListingPromo() {
  const { user, profile } = useAuth();
  const { listing } = useActiveListing();

  const [open, setOpen] = useState(false);
  const [instagram, setInstagram] = useState("");
  const [include, setInclude] = useState<string[]>([
    "listing_photos",
    "property_info",
    "payment_scenarios",
    "my_branding",
  ]);
  const [videoUrl, setVideoUrl] = useState("");
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Prefill the IG handle from the agent's saved profile once known.
  useEffect(() => {
    if (profile?.instagram) setInstagram((cur) => cur || profile.instagram || "");
  }, [profile?.instagram]);

  const price = listing?.price ?? null;
  const photos = listing?.photos ?? [];
  const address = listing
    ? [listingLabel(listing), listing.zip].filter(Boolean).join(" ")
    : null;

  function toggle(key: string) {
    setInclude((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
  }

  async function onVideoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPromoVideo(file);
      setVideoUrl(url);
      if (!include.includes("walkthrough_video")) toggle("walkthrough_video");
      toast({ emoji: "🎬", title: "Video uploaded", body: "We'll edit it into your reel." });
    } catch (err) {
      toast({ emoji: "⚠️", title: "Upload didn't work", body: err instanceof Error ? err.message : "Try pasting a link instead." });
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!user) {
      toast({ emoji: "🔒", title: "Log in to request", body: "Create a free account so we can build and post your content." });
      return;
    }
    setSending(true);
    const res = await submitPromotionRequest({
      listing_id: listing?.id ?? null,
      address,
      price,
      photos,
      instagram: instagram.trim() || null,
      video_url: videoUrl.trim() || null,
      include,
      note: note.trim() || null,
      agent: {
        name: fullName(profile) || null,
        email: profile?.email ?? user.email ?? null,
        phone: profile?.phone ?? null,
        brokerage: profile?.brokerage ?? null,
      },
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
      toast({ emoji: "📣", title: "Request received!", body: "Our team will build your post and reach out to collab on Instagram." });
    } else {
      toast({ emoji: "⚠️", title: "Couldn't send", body: res.error || "Please try again in a moment." });
    }
  }

  return (
    <div className="mb-10 overflow-hidden rounded-3xl border border-crush-200 bg-gradient-to-br from-crush-50 to-white">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6 sm:p-7">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-crush-600">Done for you · Instagram</p>
          <h2 className="mt-1 text-2xl font-bold text-ink-900">Want us to promote your listings on Instagram?</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Opt in and our marketing team builds the post for you — using your listing&apos;s photos and details,
            sample payment scenarios, and a co-branded flyer. We post it as a <strong>collab with your account</strong>,
            so it&apos;s your brand out front and your leads stay yours.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 rounded-full bg-crush-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-crush-600"
        >
          {open ? "Hide" : "Yes — promote my listing"}
        </button>
      </div>

      {open && (
        <div className="border-t border-crush-200 bg-white/70 p-6 sm:p-7">
          {/* Which listing */}
          <div className="rounded-2xl border border-border bg-white p-4">
            <span className={lbl}>Listing to promote</span>
            {listing ? (
              <div className="mt-1.5">
                <p className="font-semibold text-ink-900">{address}</p>
                <p className="text-sm text-muted">
                  {price ? `$${Math.round(price).toLocaleString("en-US")}` : "Price TBD"}
                  {photos.length > 0 ? ` · ${photos.length} photo${photos.length === 1 ? "" : "s"} on file` : ""}
                </p>
                {photos.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {photos.slice(0, 6).map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={src} src={src} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-1.5 text-sm text-muted">
                Pick one of your saved listings above and its photos &amp; details fill in here automatically. No listing yet? Add one from{" "}
                <a href="/listings" className="font-semibold text-crush-600">My Listings</a> and it&apos;ll pull straight from the MLS.
              </p>
            )}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={lbl}>Your Instagram handle</span>
              <input className={`${inp} mt-1.5`} placeholder="@youragent" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
              <span className="mt-1 block text-xs text-muted">We&apos;ll invite this account to the collab so the post lands on both feeds.</span>
            </label>

            <div className="block">
              <span className={lbl}>Walkthrough video (optional)</span>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-surface-2">
                  {uploading ? "Uploading…" : "Upload video"}
                  <input type="file" accept="video/*" className="hidden" onChange={onVideoFile} disabled={uploading} />
                </label>
                <span className="text-xs text-muted">or paste a link</span>
              </div>
              <input className={`${inp} mt-2`} placeholder="Drive / Dropbox / YouTube link" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
            </div>
          </div>

          {/* What to include */}
          <div className="mt-5">
            <span className={lbl}>What should we include?</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {INCLUDE_OPTIONS.map(([key, label]) => {
                const on = include.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggle(key)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${on ? "bg-crush-500 text-white" : "border border-border bg-white text-ink-800 hover:bg-surface-2"}`}
                  >
                    {on ? "✓ " : ""}{label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mt-5 block">
            <span className={lbl}>Anything else? (optional)</span>
            <textarea className={`${inp} mt-1.5 min-h-[70px]`} placeholder="Open house this weekend, price just improved, target buyer, etc." value={note} onChange={(e) => setNote(e.target.value)} />
          </label>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={sending || sent}
              className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-60"
            >
              {sent ? "Request sent ✓" : sending ? "Sending…" : "Send my promotion request"}
            </button>
            <span className="text-xs text-muted">Free for our partner agents. We&apos;ll reach out to schedule the collab.</span>
          </div>
          <p className="mt-4 rounded-xl border border-border bg-surface p-3 text-xs text-muted">
            You stay front-and-center: your branding, your contact info, your leads. Crush Mortgage co-brands as your lending
            partner. Co-marketing is provided under RESPA-compliant terms.
          </p>
        </div>
      )}
    </div>
  );
}
