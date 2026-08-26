"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import JobCard from "@/components/JobCard";
import JobSearchFilter from "@/components/JobSearchFilter";
import ApplyModal from "@/components/ApplyModal";
import { SkeletonGrid } from "@/components/ui";
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

function buildPageTitle(category: string, location: string): string {
  if (category !== "ALL" && location !== "ALL") return `${category} Jobs in ${location}, Ilorin`;
  if (category !== "ALL") return `${category} Jobs in Ilorin`;
  if (location !== "ALL") return `Jobs in ${location}, Ilorin`;
  return "Jobs in Ilorin, Kwara State";
}

// ── Inner content (needs Suspense wrapper for useSearchParams) ──────────────
function JobsContent() {
  const searchParams = useSearchParams();
  const query    = searchParams.get("query")    || "";
  const location = searchParams.get("location") || "ALL";
  const category = searchParams.get("category") || "ALL";
  const type     = searchParams.get("type")     || "ALL";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query)              params.set("query",    query);
    if (location !== "ALL") params.set("location", location);
    if (category !== "ALL") params.set("category", category);
    if (type     !== "ALL") params.set("type",     type);

    fetch(`/api/jobs?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setJobs(data.jobs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query, location, category, type]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="main-content">

      {/* Page title — changes with active filters */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
          {buildPageTitle(category, location)}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {jobs.length} verified vacanc{jobs.length === 1 ? "y" : "ies"} matching your filters
        </p>
      </div>

      {/* Search & Filter bar — reads its own searchParams internally */}
      <JobSearchFilter locations={LOCATIONS} categories={CATEGORIES} />

      {/* Results */}
      {loading ? (
        <SkeletonGrid count={6} height="h-52" />
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-sm p-12 text-center space-y-2">
          <h3 className="text-lg font-bold text-slate-800">No vacancies matched your filters</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try resetting your search or selecting a broader area such as "All Ilorin Areas".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onApplyClick={setSelectedJob} />
          ))}
        </div>
      )}

      <ApplyModal
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}

// ── Page export wrapped in Suspense ─────────────────────────────────────────
export default function JobsDirectoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading Ilorin Jobs…</div>}>
      <JobsContent />
    </Suspense>
  );
}
