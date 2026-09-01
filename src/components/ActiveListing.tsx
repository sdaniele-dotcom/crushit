"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getListing, listMyListings, listingLabel, type Listing } from "@/lib/listings";

type Ctx = {
  listing: Listing | null;
  listings: Listing[];
  setListing: (l: Listing | null) => void;
};

const ActiveListingContext = createContext<Ctx>({ listing: null, listings: [], setListing: () => {} });

/** The one selected listing is remembered here so it persists across every tool
 *  in the suite and survives printing/downloading — it only changes when the
 *  agent picks another or clears it. */
const STORAGE_KEY = "crush:active-listing";
function readStoredId(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function writeStoredId(id: string | null) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* storage blocked — selection is still live in memory */ }
}

/** Provides the currently-selected listing to the marketing tools inside it.
 *  Hydrates from a ?listing=<id> deep-link if present, otherwise from the last
 *  selection saved in the browser. Safe to read even outside a provider. */
export function ActiveListingProvider({ children }: { children: ReactNode }) {
  const [listing, setListingState] = useState<Listing | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    listMyListings().then(setListings);
    // A ?listing= deep-link wins; otherwise reuse the last selection.
    const urlId = new URLSearchParams(window.location.search).get("listing");
    const id = urlId || readStoredId();
    if (id) {
      getListing(id).then((l) => {
        if (l) setListingState(l);
        else writeStoredId(null); // stale/deleted listing — forget it
      });
      if (urlId) writeStoredId(urlId);
    }
  }, []);

  const setListing = useCallback((l: Listing | null) => {
    setListingState(l);
    writeStoredId(l?.id ?? null);
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
