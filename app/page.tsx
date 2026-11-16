import { Suspense } from "react";
import Link from "next/link";
import JobGrid from "@/components/JobGrid";
import JobSearchFilter from "@/components/JobSearchFilter";
import BrowseLinks from "@/components/BrowseLinks";
import { SectionHeader } from "@/components/ui";
import { getJobs } from "@/lib/db/jobs";
import { AREA_PAGES } from "@/lib/seo/landing";

// Always show the latest jobs.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const jobs = await getJobs();
  const featuredJobs = jobs.filter((j) => j.isFeatured).slice(0, 6);
  const recentJobs = jobs.slice(0, 9);

  return (
    <div className="space-y-12 pb-16">
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-14 sm:py-20 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-5">
            <p className="px-3.5 py-1 text-white text-xs font-extrabold rounded-sm uppercase tracking-wider inline-block bg-brand-green">
              Ilorin &amp; Kwara job board
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight leading-tight">
              Find jobs in Ilorin from <span className="text-brand-on-dark">verified employers.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-200 max-w-2xl leading-relaxed">
              Apply online or on WhatsApp, track every application and message employers directly. Free for job seekers.
            </p>

            <nav aria-label="Popular areas">
              <ul className="flex flex-wrap gap-2 pt-3">
                {AREA_PAGES.slice(0, 6).map((area) => (
                  <li key={area.slug}>
                    <Link
                      href={`/jobs-in/${area.slug}`}
                      className="inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold rounded-sm border border-slate-500 transition-colors"
                    >
                      {area.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20" aria-label="Job search">
        <Suspense fallback={<div className="bg-white p-4 border border-slate-200 rounded-sm text-sm text-slate-700 shadow-sm">Loading search…</div>}>
          <JobSearchFilter />
        </Suspense>
      </section>

      {featuredJobs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <SectionHeader title="Featured vacancies" subtitle="Highlighted openings from Kwara employers" />
          <JobGrid jobs={featuredJobs} />
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <SectionHeader
          title="Latest jobs in Ilorin"
          border
          action={
            <Link href="/jobs" className="text-sm font-bold text-brand-green hover:underline">
              All jobs ({jobs.length}) →
            </Link>
          }
        />
        <JobGrid
          jobs={recentJobs}
          empty={
            <div className="bg-white border border-slate-200 rounded-sm p-10 text-center space-y-3">
              <p className="text-lg font-bold text-slate-900">New vacancies are being added.</p>
              <p className="text-slate-700">Employers: post your vacancy free and reach job seekers across Ilorin.</p>
              <Link href="/post-job" className="btn-primary inline-flex">Post a job</Link>
            </div>
          }
        />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BrowseLinks />
      </section>
    </div>
  );
}
