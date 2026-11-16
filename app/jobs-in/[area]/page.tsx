import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JobListingPage from "@/components/JobListingPage";
import { getJobs } from "@/lib/db/jobs";
import { areaBySlug } from "@/lib/seo/landing";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { area: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const area = areaBySlug(params.area);
  if (!area) return { title: "Area not found" };
  const title = `Jobs in ${area.name}, Ilorin`;
  return {
    title,
    description: `${area.intro} Apply online or on WhatsApp. Free for job seekers.`,
    alternates: { canonical: `/jobs-in/${area.slug}` },
    openGraph: { title, description: area.intro, url: `/jobs-in/${area.slug}` },
  };
}

export default async function AreaJobsPage({ params }: PageProps) {
  const area = areaBySlug(params.area);
  if (!area) notFound();

  const jobs = await getJobs({ locationArea: area.location });

  return (
    <JobListingPage
      title={`Jobs in ${area.name}, Ilorin`}
      intro={area.intro}
      jobs={jobs}
      defaultLocation={area.location}
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Jobs in Ilorin", path: "/jobs" },
        { name: area.name, path: `/jobs-in/${area.slug}` },
      ]}
    />
  );
}
