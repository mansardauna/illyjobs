"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import JobSearchFilter from "@/components/JobSearchFilter";
import ApplyModal from "@/components/ApplyModal";
import { SectionHeader, SkeletonGrid } from "@/components/ui";
import { Job } from "@/lib/db/jobs";

const LOCATIONS = [
  "Tanke / Unilorin Axis",
  "GRA",
  "Taiwo / Post Office",
  "Challenge / Unity",
  "Fate / Airport Road",
  "Asa Dam / Sawmill",
  "Sango / Kulende",
  "Ganmo / Kilanko",
  "Oke-Oyi",
  "Kwara Poly / Elekoyangan",
  "Offa Garage",
];

const CATEGORIES = [
  "Education / Teaching",
  "Technology & Software",
  "Retail & Sales",
  "Healthcare & Nursing",
  "Artisans & Technical Trades",
  "Customer Service",
  "Banking & Accounting",
  "Hospitality & Catering",
];

const HERO_AREAS = [
  "Tanke / Unilorin Axis",
  "GRA",
  "Taiwo & Unity",
  "Challenge",
  "Fate / Airport Rd",
  "Kwara Poly Axis",
];

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => { if (data.success) setJobs(data.jobs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featuredJobs = jobs.filter((j) => j.isFeatured);
  const recentJobs = jobs.slice(0, 6);

  return (
    <div className="space-y-12 pb-16" id="main-content">

      {/* ── Hero Banner ── */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-14 sm:py-20 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-5">

            <span className="px-3.5 py-1 text-white text-xs font-extrabold rounded-sm uppercase tracking-wider inline-block bg-brand-green">
              Ilorin &amp; Kwara Job Marketplace
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight leading-tight">
              Connecting Local Employers &amp; Talent{" "}
              <span className="text-brand-green">Friction-Free.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
              Find verified vacancies across Ilorin. Apply in seconds via CV upload or direct WhatsApp.
            </p>

            <div className="flex flex-wrap gap-2 pt-3">
              {HERO_AREAS.map((area) => (
                <Link
                  key={area}
                  href={`/jobs?location=${encodeURIComponent(area)}`}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-sm border border-slate-600 transition-colors"
                >
                  {area}
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Search Bar (pulled up to overlap hero) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <Suspense fallback={
          <div className="bg-white p-4 border border-slate-200 rounded-sm text-sm text-slate-400 shadow-sm">
            Loading search…
          </div>
        }>
          <JobSearchFilter locations={LOCATIONS} categories={CATEGORIES} />
        </Suspense>
      </section>

      {/* ── Featured Jobs ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <SectionHeader
          title="Featured Vacancies"
          subtitle="Top verified openings from trusted Kwara employers"
          action={
            <Link href="/jobs" className="text-sm font-bold text-brand-green hover:underline">
              All Jobs ({jobs.length}) →
            </Link>
          }
        />

        {loading ? (
          <SkeletonGrid count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} onApplyClick={setSelectedJob} />
            ))}
          </div>
        )}
      </section>

      {/* ── Recent Openings ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <SectionHeader
          title="Recent Job Openings"
          border
          action={
            <Link href="/jobs" className="text-sm font-bold text-brand-green hover:underline">
              Browse Directory →
            </Link>
          }
        />

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentJobs.map((job) => (
              <JobCard key={job.id} job={job} onApplyClick={setSelectedJob} />
            ))}
          </div>
        )}
      </section>

      {/* ── Apply Modal ── */}
      <ApplyModal
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}
