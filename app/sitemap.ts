import type { MetadataRoute } from "next";
import { getJobs } from "@/lib/db/jobs";
import { AREA_PAGES, CATEGORY_PAGES } from "@/lib/seo/landing";
import { SITE_URL } from "@/lib/site";

// Rebuild hourly so newly posted jobs appear and closed ones drop out.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getJobs(); // live jobs only
  const newest = jobs.reduce<string | undefined>(
    (latest, job) => (!latest || job.postedAt > latest ? job.postedAt : latest),
    undefined
  );
  const listingsUpdated = newest || new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: listingsUpdated, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/jobs`, lastModified: listingsUpdated, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/pricing`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const landingRoutes: MetadataRoute.Sitemap = [
    ...AREA_PAGES.map((a) => `/jobs-in/${a.slug}`),
    ...CATEGORY_PAGES.map((c) => `/job-categories/${c.slug}`),
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: listingsUpdated,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${SITE_URL}/jobs/${job.slug}`,
    lastModified: job.postedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...landingRoutes, ...jobRoutes];
}
