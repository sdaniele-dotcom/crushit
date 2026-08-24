"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { LEVELS, type Level } from "@/lib/levels";

/** Live level thresholds from the DB (admin-editable); falls back to defaults. */
export function useLevels(): Level[] {
  const [levels, setLevels] = useState<Level[]>(LEVELS);
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.from("levels")
      .select("name,min_stars,icon,blurb")
      .order("min_stars")
      .then(({ data }) => {
        if (data && data.length) {
          setLevels(
            data.map((l) => ({
              name: l.name as string,
              min: l.min_stars as number,
              icon: (l.icon as string) || undefined,
              blurb: (l.blurb as string) || undefined,
            })),
          );
        }
      });
  }, []);
  return levels;
}
