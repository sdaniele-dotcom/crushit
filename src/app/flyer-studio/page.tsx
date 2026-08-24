"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ActiveListingProvider, ListingPicker } from "@/components/ActiveListing";
import { FlyerStudio } from "@/components/FlyerStudio";
import type { FlyerCategory } from "@/lib/flyerTemplates";

function StudioInner() {
  const [cat, setCat] = useState<FlyerCategory | "all">("all");
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("category");
    if (c && ["listing", "open-house", "luxury", "sold"].includes(c)) setCat(c as FlyerCategory);
  }, []);

  return (
    <ActiveListingProvider>
      <PageHero
        eyebrow="Marketing · Flyer studio"
        title={<>Flyer <span className="text-gradient">template library</span></>}
        subtitle="Pick a template, drop in your photos, edit the text, and print. Everything auto-fills from your profile and saved listings."
      />
      <Container className="py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard" className="text-sm font-semibold text-crush-600">← Dashboard</Link>
          <Link href="/co-brand" className="text-sm font-semibold text-crush-600">Need financing on the flyer? Use the co-branded flyer →</Link>
        </div>
        <ListingPicker />
        <FlyerStudio initialCategory={cat} />
      </Container>
    </ActiveListingProvider>
  );
}

export default function FlyerStudioPage() {
  return (
    <RequireAuth>
      <StudioInner />
    </RequireAuth>
  );
}
