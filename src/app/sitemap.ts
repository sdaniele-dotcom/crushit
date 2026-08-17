import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

/** All statically-exported routes, for search engines. */
const routes = [
  "/",
  "/calculators",
  "/loan-programs",
  "/mls-search",
  "/resources",
  "/co-marketing",
  "/co-marketing/social-kit",
  "/co-marketing/email-templates",
  "/co-marketing/video-scripts",
  "/co-marketing/open-house-kit",
  "/co-brand",
  "/first-time-buyers",
  "/guides/document-checklist",
  "/guides/closing-day",
  "/guides/glossary",
  "/team",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((path) => ({
    url: `${site.siteUrl}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
