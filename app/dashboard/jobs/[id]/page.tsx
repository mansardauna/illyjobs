"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, MessageCircle, Phone, Mail } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import SignInPrompt from "@/components/SignInPrompt";
import { APPLICATION_STATUSES, STATUS_LABELS, type ApplicationStatus } from "@/lib/constants";
import { formatDate } from "@/lib/format";

interface Applicant {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  locationArea: string;
  coverNote?: string;
  resumePath?: string;
  resumeFileName?: string;
  status: ApplicationStatus;
  submittedAt: string;
  unread: number;
  job: { id: string; title: string; slug: string } | null;
}

export default function JobApplicantsPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[] | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const [appsRes, jobsRes] = await Promise.all([
        fetch(`/api/applications?jobId=${encodeURIComponent(params.id)}`, { cache: "no-store" }),
        fetch("/api/employer/jobs", { cache: "no-store" }),
      ]);
      const apps = await appsRes.json();
      const jobs = await jobsRes.json();
      if (!apps.success) {
        setError(apps.error || "Could not load applicants.");
        return;
      }
      const job = (jobs.jobs || []).find((j: { id: string }) => j.id === params.id);
      if (!job) {
        setError("This job was not found in your account.");
        return;
      }
      setJobTitle(job.title);
      setApplicants(apps.applications);
    } catch {
      setError("Network error. Please refresh the page.");
    }
  }, [params.id]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const changeStatus = async (applicant: Applicant, status: ApplicationStatus) => {
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/applications/${applicant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setApplicants((list) => (list || []).map((a) => (a.id === applicant.id ? { ...a, status } : a)));
        setNotice(`${applicant.applicantName} moved to "${STATUS_LABELS[status]}". They have been notified.`);
      } else {
        setError(data.error || "Could not update the status.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  if (loading) return <p role="status" className="p-12 text-center text-slate-700">Loading…</p>;
  if (!user) return <SignInPrompt next={`/dashboard/jobs/${params.id}`} message="Sign in to see your applicants." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to dashboard
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Applicants{jobTitle && <> for {jobTitle}</>}
        </h1>
        {applicants && (
          <p className="text-slate-700 mt-1">
            {applicants.length} application{applicants.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <div aria-live="polite">
        {error && <p role="alert" className="text-sm text-rose-800">{error}</p>}
        {notice && <p className="text-sm text-emerald-900">{notice}</p>}
      </div>

      {!applicants && !error && <p role="status" className="text-sm text-slate-700">Loading applicants…</p>}

      {applicants && applicants.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-sm p-8 text-center text-slate-800">
          No one has applied through Illy Jobs yet. Applications sent by WhatsApp are not listed here.
        </div>
      )}

      {applicants && applicants.length > 0 && (
        <ul className="space-y-4">
          {applicants.map((a) => (
            <li key={a.id} className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{a.applicantName}</h2>
                  <p className="text-sm text-slate-700">
                    {a.locationArea} • Applied {formatDate(a.submittedAt)}
                  </p>
                </div>
                <div>
                  <label htmlFor={`status-${a.id}`} className="block text-xs font-bold text-slate-800 mb-1">
                    Status for {a.applicantName}
                  </label>
                  <select
                    id={`status-${a.id}`}
                    value={a.status}
                    onChange={(e) => changeStatus(a, e.target.value as ApplicationStatus)}
                    className="px-3 py-2 bg-white border border-slate-400 rounded-sm text-sm font-semibold text-slate-900"
                  >
                    {APPLICATION_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {a.coverNote && (
                <p className="text-sm text-slate-800 whitespace-pre-line bg-slate-50 border border-slate-200 rounded-sm p-3">
                  {a.coverNote}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
                <a href={`tel:${a.applicantPhone}`} className="inline-flex items-center gap-1.5 text-slate-800 hover:underline">
                  <Phone className="w-4 h-4" aria-hidden="true" /> {a.applicantPhone}
                </a>
                <a href={`mailto:${a.applicantEmail}`} className="inline-flex items-center gap-1.5 text-slate-800 hover:underline">
                  <Mail className="w-4 h-4" aria-hidden="true" /> {a.applicantEmail}
                </a>
                {a.resumePath ? (
                  <a
                    href={`/api/files/resume?applicationId=${a.id}`}
                    className="inline-flex items-center gap-1.5 text-brand-green hover:underline"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" /> Download CV
                    <span className="sr-only"> of {a.applicantName}</span>
                  </a>
                ) : (
                  <span className="text-slate-600 font-normal">No CV attached</span>
                )}
                <Link href={`/messages/${a.id}`} className="inline-flex items-center gap-1.5 text-brand-green hover:underline">
                  <MessageCircle className="w-4 h-4" aria-hidden="true" /> Message
                  <span className="sr-only"> {a.applicantName}</span>
                  {a.unread > 0 && (
                    <span className="px-1.5 py-0.5 bg-rose-700 text-white text-xs font-bold rounded-full">
                      {a.unread}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
