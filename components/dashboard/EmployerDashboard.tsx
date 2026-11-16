"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui";
import ProfileForm from "./ProfileForm";
import { formatDate } from "@/lib/format";

interface EmployerJob {
  id: string;
  title: string;
  slug: string;
  locationArea: string;
  postedAt: string;
  closesAt?: string;
  active: boolean;
  applicantCount: number;
  newApplicantCount: number;
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<EmployerJob[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/employer/jobs", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setJobs(data.jobs);
        else setError(data.error || "Could not load your jobs.");
      })
      .catch(() => setError("Network error. Please refresh the page."));
  }, []);

  useEffect(load, [load]);

  const setStatus = async (job: EmployerJob, status: "OPEN" | "CLOSED") => {
    setBusyId(job.id);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setNotice(status === "OPEN" ? `"${job.title}" is live again for 30 days.` : `"${job.title}" has been closed.`);
        load();
      } else {
        setError(data.error || "Could not update the job.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <section className="lg:col-span-3 space-y-4" aria-labelledby="my-jobs">
        <div className="flex items-center justify-between gap-3">
          <h2 id="my-jobs" className="text-xl font-bold text-slate-900">
            My job posts
          </h2>
          <Link href="/post-job" className="btn-primary py-2 px-4 text-sm">
            <PlusCircle className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Post a job
          </Link>
        </div>

        {user && !user.isVerified && (
          <p className="p-3 bg-amber-50 border border-amber-300 rounded-sm text-sm text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Your business is not verified yet, so your jobs do not show the &ldquo;Verified employer&rdquo; badge.
              Contact Illy Jobs to get verified.
            </span>
          </p>
        )}

        <div aria-live="polite">
          {error && <p role="alert" className="text-sm text-rose-800">{error}</p>}
          {notice && <p className="text-sm text-emerald-900">{notice}</p>}
        </div>

        {!jobs && !error && <p role="status" className="text-sm text-slate-700">Loading your jobs…</p>}

        {jobs && jobs.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-sm p-8 text-center space-y-3">
            <p className="text-slate-800 font-semibold">You have not posted any jobs yet.</p>
            <Link href="/post-job" className="btn-primary inline-flex">Post your first vacancy</Link>
          </div>
        )}

        {jobs && jobs.length > 0 && (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li key={job.id} className="bg-white border border-slate-200 rounded-sm p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900">
                      <Link href={`/jobs/${job.slug}`} className="hover:underline">
                        {job.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-slate-700">
                      {job.locationArea} • Posted {formatDate(job.postedAt)}
                      {job.active && job.closesAt && <> • Closes {formatDate(job.closesAt)}</>}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2.5 py-0.5 text-xs font-bold border rounded-sm ${
                      job.active
                        ? "bg-emerald-50 text-emerald-900 border-emerald-400"
                        : "bg-slate-100 text-slate-800 border-slate-300"
                    }`}
                  >
                    {job.active ? "Live" : "Closed"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link href={`/dashboard/jobs/${job.id}`} className="text-sm font-bold text-brand-green hover:underline">
                    {job.applicantCount} applicant{job.applicantCount === 1 ? "" : "s"}
                    {job.newApplicantCount > 0 && <> ({job.newApplicantCount} new)</>}
                    <span className="sr-only"> for {job.title}</span> →
                  </Link>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busyId === job.id}
                    onClick={() => setStatus(job, job.active ? "CLOSED" : "OPEN")}
                    className="px-3 py-1.5 text-sm"
                  >
                    {job.active ? "Close job" : "Reopen for 30 days"}
                    <span className="sr-only">: {job.title}</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="lg:col-span-2 space-y-4" aria-labelledby="company-profile">
        <h2 id="company-profile" className="text-xl font-bold text-slate-900">
          Company profile
        </h2>
        <ProfileForm />
      </section>
    </div>
  );
}
