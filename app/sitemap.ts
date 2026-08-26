import { MetadataRoute } from "next";
import { getJobs } from "@/lib/db/jobs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://illyjobs.ng";

  // Static routes
  const routes = [
    "",
    "/jobs",
    "/post-job",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic Job routes
  const jobs = await getJobs();
  const jobRoutes = jobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.slug}`,
    lastModified: job.postedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Dynamic Location routes for SEO
  const locations = [
    "Tanke",
    "GRA",
    "Taiwo",
    "Challenge",
    "Fate",
    "Asa Dam",
    "Sango",
    "Kwara Poly",
  ].map((loc) => ({
    url: `${baseUrl}/jobs?location=${encodeURIComponent(loc)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...routes, ...jobRoutes, ...locations];
}
