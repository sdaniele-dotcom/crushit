import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { PUBLIC_ROUTES } from "@/lib/routes";

export const dynamic = "force-static";

/**
 * The routes a search engine can actually read.
 *
 * This list used to hold 22 entries — every exported route. 21 of them are
 * behind the login gate: AppFrame redirects a logged-out visitor to /login,
 * so a crawler following the sitemap got a spinner and then a redirect, not
 * the calculators and guides the sitemap promised. A sitemap full of pages
 * that cannot be read is worse than a short one; it spends crawl budget to
 * advertise content nobody outside the gate can reach.
 *
 * So this list is now the public surface, and it is derived from the one
 * place that already decides what is public — AppFrame's own route lists —
 * rather than maintained separately and allowed to drift again.
 *
 * To put a page back in here, make it readable logged-out first. The two are
 * the same decision and should not be made in two files.
 */
const routes = ["/", ...PUBLIC_ROUTES];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((path) => ({
    url: `${site.siteUrl}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
