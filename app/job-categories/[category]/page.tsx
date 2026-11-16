import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JobListingPage from "@/components/JobListingPage";
import { getJobs } from "@/lib/db/jobs";
import { categoryBySlug } from "@/lib/seo/landing";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { category: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const category = categoryBySlug(params.category);
  if (!category) return { title: "Category not found" };
  const title = `${category.name} jobs in Ilorin`;
  return {
    title,
    description: `${category.intro} Apply online or on WhatsApp. Free for job seekers.`,
    alternates: { canonical: `/job-categories/${category.slug}` },
    openGraph: { title, description: category.intro, url: `/job-categories/${category.slug}` },
  };
}

export default async function CategoryJobsPage({ params }: PageProps) {
  const category = categoryBySlug(params.category);
  if (!category) notFound();

  const jobs = await getJobs({ category: category.category });

  return (
    <JobListingPage
      title={`${category.name} jobs in Ilorin`}
      intro={category.intro}
      jobs={jobs}
      defaultCategory={category.category}
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Jobs in Ilorin", path: "/jobs" },
        { name: category.name, path: `/job-categories/${category.slug}` },
      ]}
    />
  );
}
