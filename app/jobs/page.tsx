import type { Metadata } from "next";
import JobListingPage from "@/components/JobListingPage";
import { getJobs } from "@/lib/db/jobs";
import { areaByLocation, categoryByName } from "@/lib/seo/landing";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { query?: string; location?: string; category?: string; type?: string };
}

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) || "";
}

function buildTitle(category: string, location: string, query: string): string {
  if (query) return `"${query}" jobs in Ilorin`;
  if (category && location) return `${category} jobs in ${location}, Ilorin`;
  if (category) return `${category} jobs in Ilorin`;
  if (location) return `Jobs in ${location}, Ilorin`;
  return "Jobs in Ilorin, Kwara State";
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const query = one(searchParams.query);
  const location = one(searchParams.location);
  const category = one(searchParams.category);
  const type = one(searchParams.type);
  const filtered = Boolean(query || location || category || type);

  // A single area or category filter has its own landing page; point search engines there.
  let canonical = "/jobs";
  const area = areaByLocation(location);
  const cat = categoryByName(category);
  if (area && !category && !query && !type) canonical = `/jobs-in/${area.slug}`;
  else if (cat && !location && !query && !type) canonical = `/job-categories/${cat.slug}`;

  return {
    title: buildTitle(category, location, query),
    description:
      "Browse the latest verified job vacancies in Ilorin and Kwara State. Filter by area, category and job type, then apply online or on WhatsApp.",
    alternates: { canonical },
    // Filter combinations and keyword searches are not separate pages worth indexing.
    robots: filtered && canonical === "/jobs" ? { index: false, follow: true } : undefined,
  };
}

export default async function JobsDirectoryPage({ searchParams }: PageProps) {
  const query = one(searchParams.query);
  const location = one(searchParams.location);
  const category = one(searchParams.category);
  const type = one(searchParams.type);

  const jobs = await getJobs({
    query: query || undefined,
    locationArea: location || undefined,
    category: category || undefined,
    employmentType: type || undefined,
  });

  return (
    <JobListingPage
      // Remount the search form when the filters in the URL change.
      key={`${query}|${location}|${category}|${type}`}
      title={buildTitle(category, location, query)}
      jobs={jobs}
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Jobs in Ilorin", path: "/jobs" },
      ]}
    />
  );
}
