"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getListing, listMyListings, listingLabel, type Listing } from "@/lib/listings";

type Ctx = {
  listing: Listing | null;
  listings: Listing[];
  setListing: (l: Listing | null) => void;
};

const ActiveListingContext = createContext<Ctx>({ listing: null, listings: [], setListing: () => {} });

/** Provides a currently-selected listing to the marketing tools inside it,
 *  seeded from a ?listing=<id> URL param. Safe to read even outside a provider. */
export function ActiveListingProvider({ children }: { children: ReactNode }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    listMyListings().then(setListings);
    const id = new URLSearchParams(window.location.search).get("listing");
    if (id) getListing(id).then((l) => l && setListing(l));
  }, []);

  return (
    <ActiveListingContext.Provider value={{ listing, listings, setListing }}>
      {children}
    </ActiveListingContext.Provider>
  );
}

export function useActiveListing() {
  return useContext(ActiveListingContext);
}

/** Dropdown that lets the agent pick which saved listing personalizes the page. */
export function ListingPicker() {
  const { listing, listings, setListing } = useActiveListing();
  if (listings.length === 0) return null;
  return (
    <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-crush-200 bg-crush-50 px-4 py-3">
      <span className="text-sm font-semibold text-crush-800">🏠 Personalize with a listing:</span>
      <select
        value={listing?.id ?? ""}
        onChange={(e) => setListing(listings.find((l) => l.id === e.target.value) ?? null)}
        className="rounded-full border border-crush-200 bg-white px-4 py-2 text-sm font-medium text-ink-900 outline-none focus:border-crush-400"
      >
        <option value="">None — use placeholders</option>
        {listings.map((l) => (
          <option key={l.id} value={l.id}>{listingLabel(l)}</option>
        ))}
      </select>
      {listing && <span className="text-xs text-crush-700">Property details now fill in automatically.</span>}
    </div>
  );
}
