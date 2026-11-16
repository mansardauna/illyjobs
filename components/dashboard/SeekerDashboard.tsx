"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import ProfileForm from "./ProfileForm";
import { formatDate } from "@/lib/format";
import type { ApplicationStatus } from "@/lib/constants";

export interface ApplicationRow {
  id: string;
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  applicantName: string;
  unread: number;
  lastMessage: { body: string; createdAt: string } | null;
  job: { id: string; title: string; slug: string; company: string; locationArea: string } | null;
}

export default function SeekerDashboard() {
  const [applications, setApplications] = useState<ApplicationRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/applications", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setApplications(data.applications);
        else setError(data.error || "Could not load your applications.");
      })
      .catch(() => setError("Network error. Please refresh the page."));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <section className="lg:col-span-3 space-y-4" aria-labelledby="my-applications">
        <h2 id="my-applications" className="text-xl font-bold text-slate-900">
          My applications
        </h2>

        {error && <p role="alert" className="text-sm text-rose-800">{error}</p>}

        {!applications && !error && <p role="status" className="text-sm text-slate-700">Loading your applications…</p>}

        {applications && applications.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-sm p-8 text-center space-y-3">
            <p className="text-slate-800 font-semibold">You have not applied for any jobs yet.</p>
            <Link href="/jobs" className="btn-primary inline-flex">Browse jobs in Ilorin</Link>
          </div>
        )}

        {applications && applications.length > 0 && (
          <ul className="space-y-3">
            {applications.map((app) => (
              <li key={app.id} className="bg-white border border-slate-200 rounded-sm p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900">
                      {app.job ? (
                        <Link href={`/jobs/${app.job.slug}`} className="hover:underline">
                          {app.job.title}
                        </Link>
                      ) : (
                        "Job removed"
                      )}
                    </h3>
                    {app.job && (
                      <p className="text-sm text-slate-700">
                        {app.job.company} • {app.job.locationArea}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <p className="text-slate-600">
                    Applied {formatDate(app.submittedAt)}
                    {app.updatedAt !== app.submittedAt && <> • Updated {formatDate(app.updatedAt)}</>}
                  </p>
                  <Link
                    href={`/messages/${app.id}`}
                    className="inline-flex items-center gap-1.5 font-bold text-brand-green hover:underline"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    Messages
                    {app.unread > 0 && (
                      <span className="px-1.5 py-0.5 bg-rose-700 text-white text-xs font-bold rounded-full">
                        {app.unread}
                        <span className="sr-only"> unread</span>
                      </span>
                    )}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="lg:col-span-2 space-y-4" aria-labelledby="my-profile">
        <h2 id="my-profile" className="text-xl font-bold text-slate-900">
          Profile and CV
        </h2>
        <ProfileForm />
      </section>
    </div>
  );
}
