"use client";

import { getSupabase } from "@/lib/supabase";

/** Downscale + JPEG-compress an image file to a Blob. */
function resizeToBlob(file: File, max: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("encode failed"))),
          "image/jpeg",
          0.85,
        );
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MAX: Record<string, number> = {
  headshot: 640,
  brokerage_logo: 500,
  team_logo: 500,
};

/**
 * Upload a profile image to the agent's own folder in the agent-assets bucket
 * and return its public URL. Requires an authenticated Supabase session.
 */
export async function uploadAgentImage(
  file: File,
  kind: "headshot" | "brokerage_logo" | "team_logo",
): Promise<string> {
  const sb = getSupabase();
  if (!sb) throw new Error("Not signed in.");
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const blob = await resizeToBlob(file, MAX[kind] ?? 640);
  const path = `${user.id}/${kind}-${Date.now()}.jpg`;
  const { error } = await sb.storage
    .from("agent-assets")
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (error) {
    const m = error.message || "";
    if (/bucket not found|not found/i.test(m)) {
      throw new Error(
        "Image storage isn't set up yet. Ask your admin to run the agent-assets storage setup in Supabase.",
      );
    }
    if (/row-level security|policy|not authorized|permission/i.test(m)) {
      throw new Error("Not allowed to upload. Please log out and back in, then try again.");
    }
    throw new Error(m || "Upload failed. Please try again.");
  }
  const { data } = sb.storage.from("agent-assets").getPublicUrl(path);
  return data.publicUrl;
}
