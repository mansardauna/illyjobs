"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import SignInPrompt from "@/components/SignInPrompt";
import StatusBadge from "@/components/StatusBadge";
import { timeAgo } from "@/lib/format";
import type { ApplicationStatus } from "@/lib/constants";

interface Thread {
  id: string;
  status: ApplicationStatus;
  submittedAt: string;
  applicantName: string;
  unread: number;
  lastMessage: { body: string; createdAt: string } | null;
  job: { title: string; company: string } | null;
}

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch("/api/applications", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error || "Could not load your conversations.");
          return;
        }
        const sorted = [...(data.applications as Thread[])].sort((a, b) => {
          const at = a.lastMessage?.createdAt || a.submittedAt;
          const bt = b.lastMessage?.createdAt || b.submittedAt;
          return new Date(bt).getTime() - new Date(at).getTime();
        });
        setThreads(sorted);
      })
      .catch(() => setError("Network error. Please refresh the page."));
  }, [user]);

  if (loading) return <p role="status" className="p-12 text-center text-slate-700">Loading…</p>;
  if (!user) return <SignInPrompt next="/messages" message="Sign in to read your messages." />;

  const isSeeker = user.role === "JOB_SEEKER";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Messages</h1>
        <p className="text-slate-700 mt-1">
          {isSeeker
            ? "Conversations with employers about your applications."
            : "Conversations with people who applied to your jobs."}
        </p>
      </div>

      {error && <p role="alert" className="text-sm text-rose-800">{error}</p>}
      {!threads && !error && <p role="status" className="text-sm text-slate-700">Loading conversations…</p>}

      {threads && threads.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-sm p-8 text-center text-slate-800">
          {isSeeker
            ? "No conversations yet. Each job you apply for gets its own conversation with the employer."
            : "No conversations yet. Each application to your jobs gets its own conversation."}
        </div>
      )}

      {threads && threads.length > 0 && (
        <ul className="bg-white border border-slate-200 rounded-sm shadow-sm divide-y divide-slate-200">
          {threads.map((t) => (
            <li key={t.id}>
              <Link href={`/messages/${t.id}`} className="block p-4 sm:p-5 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-base text-slate-900 ${t.unread > 0 ? "font-extrabold" : "font-bold"}`}>
                      {isSeeker ? t.job?.company || "Employer" : t.applicantName}
                      {t.unread > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-rose-700 text-white text-xs font-bold rounded-full align-middle">
                          {t.unread}
                          <span className="sr-only"> unread</span>
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-700">{t.job?.title || "Job removed"}</p>
                    <p className="text-sm text-slate-600 truncate mt-1">
                      {t.lastMessage ? t.lastMessage.body : "No messages yet. Say hello."}
                    </p>
                  </div>
                  <div className="shrink-0 text-right space-y-1">
                    <StatusBadge status={t.status} />
                    <p className="text-xs text-slate-600">{timeAgo(t.lastMessage?.createdAt || t.submittedAt)}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
