import { Suspense } from "react";
import Link from "next/link";
import JobGrid from "@/components/JobGrid";
import JobSearchFilter from "@/components/JobSearchFilter";
import BrowseLinks from "@/components/BrowseLinks";
import JsonLd from "@/components/seo/JsonLd";
import type { Job } from "@/lib/db/jobs";
import { breadcrumbSchema, jobListSchema } from "@/lib/seo/schema";

interface JobListingPageProps {
  title: string;
  intro?: string;
  jobs: Job[];
  breadcrumbs: { name: string; path: string }[];
  defaultLocation?: string;
  defaultCategory?: string;
}

/** Shared server-rendered layout for /jobs and the area and category landing pages. */
export default function JobListingPage({
  title,
  intro,
  jobs,
  breadcrumbs,
  defaultLocation,
  defaultCategory,
}: JobListingPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <JsonLd data={[breadcrumbSchema(breadcrumbs), jobListSchema(title, jobs)]} />

      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-700">
          {breadcrumbs.map((crumb, index) => {
            const last = index === breadcrumbs.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="font-semibold text-slate-900">{crumb.name}</span>
                ) : (
                  <>
                    <Link href={crumb.path} className="underline hover:text-slate-900">{crumb.name}</Link>
                    <span aria-hidden="true">/</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">{title}</h1>
        {intro && <p className="text-slate-700 mt-2 max-w-3xl">{intro}</p>}
        <p className="text-sm text-slate-700 mt-2" role="status">
          {jobs.length} open vacanc{jobs.length === 1 ? "y" : "ies"}
        </p>
      </div>

      <Suspense fallback={<div className="bg-white p-4 border border-slate-200 rounded-sm text-sm text-slate-700">Loading search…</div>}>
        <JobSearchFilter defaultLocation={defaultLocation} defaultCategory={defaultCategory} />
      </Suspense>

      <JobGrid
        jobs={jobs}
        headingLevel="h2"
        empty={
          <div className="bg-white border border-slate-200 rounded-sm p-10 text-center space-y-3">
            <h2 className="text-lg font-bold text-slate-900">No open vacancies here right now</h2>
            <p className="text-slate-700 max-w-md mx-auto">
              New jobs are added every day. Try a wider search, or browse all jobs in Ilorin.
            </p>
            <Link href="/jobs" className="btn-primary inline-flex">Browse all jobs</Link>
          </div>
        }
      />

      <div className="pt-6 border-t border-slate-200">
        <BrowseLinks />
      </div>
    </div>
  );
}
