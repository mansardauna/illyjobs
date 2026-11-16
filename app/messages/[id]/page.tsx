"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import SignInPrompt from "@/components/SignInPrompt";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import type { ApplicationStatus } from "@/lib/constants";

interface ChatMessage {
  id: string;
  kind: "TEXT" | "STATUS";
  body: string;
  createdAt: string;
  mine: boolean;
}

interface ThreadData {
  viewerRole: "APPLICANT" | "EMPLOYER";
  application: { id: string; status: ApplicationStatus; applicantName: string };
  job: { id: string; title: string; slug: string; company: string };
  messages: ChatMessage[];
}

const POLL_MS = 8000;
const MAX_LENGTH = 2000;

export default function ConversationPage({ params }: { params: { id: string } }) {
  const { user, loading, refreshUnread } = useAuth();
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/applications/${params.id}/messages`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setThread(data);
        setError("");
      } else if (res.status === 404 || res.status === 401) {
        setError(data.error || "Conversation not found.");
      }
    } catch {
      // Keep showing what we have; the next poll will retry.
    }
  }, [params.id]);

  useEffect(() => {
    if (!user) return;
    load().then(refreshUnread);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [user, load, refreshUnread]);

  // Scroll to the newest message when one arrives.
  const count = thread?.messages.length || 0;
  useEffect(() => {
    if (count !== lastCount.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    lastCount.current = count;
  }, [count]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch(`/api/applications/${params.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();
      if (data.success) {
        setDraft("");
        setThread((current) => (current ? { ...current, messages: [...current.messages, data.message] } : current));
      } else {
        setSendError(data.error || "Could not send your message.");
      }
    } catch {
      setSendError("Network error. Your message was not sent.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p role="status" className="p-12 text-center text-slate-700">Loading…</p>;
  if (!user) return <SignInPrompt next={`/messages/${params.id}`} message="Sign in to read this conversation." />;

  const otherParty = thread
    ? thread.viewerRole === "APPLICANT"
      ? thread.job.company
      : thread.application.applicantName
    : "";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      <Link href="/messages" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> All messages
      </Link>

      {error && <p role="alert" className="text-rose-800">{error}</p>}
      {!thread && !error && <p role="status" className="text-slate-700">Loading conversation…</p>}

      {thread && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{otherParty}</h1>
              <p className="text-slate-700">
                About{" "}
                <Link href={`/jobs/${thread.job.slug}`} className="font-semibold underline">
                  {thread.job.title}
                </Link>
              </p>
            </div>
            <StatusBadge status={thread.application.status} />
          </div>

          <div
            ref={listRef}
            role="log"
            aria-live="polite"
            aria-label={`Conversation with ${otherParty}`}
            tabIndex={0}
            className="bg-white border border-slate-200 rounded-sm shadow-sm p-4 h-[50vh] min-h-[280px] overflow-y-auto space-y-3"
          >
            {thread.messages.length === 0 && (
              <p className="text-sm text-slate-700 text-center py-8">
                No messages yet. Send the first one below.
              </p>
            )}

            {thread.messages.map((m) =>
              m.kind === "STATUS" ? (
                <p key={m.id} className="text-center text-xs text-slate-700">
                  <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 rounded-full">
                    {m.body} • {formatDateTime(m.createdAt)}
                  </span>
                </p>
              ) : (
                <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-sm text-sm ${
                      m.mine ? "bg-brand-green text-white" : "bg-slate-100 text-slate-900 border border-slate-200"
                    }`}
                  >
                    <span className="sr-only">{m.mine ? "You: " : `${otherParty}: `}</span>
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={`text-xs mt-1 ${m.mine ? "text-emerald-50" : "text-slate-600"}`}>
                      {formatDateTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>

          <form onSubmit={handleSend} className="space-y-2">
            <label htmlFor="message-draft" className="block text-sm font-bold text-slate-800">
              Your message
            </label>
            <textarea
              id="message-draft"
              rows={3}
              maxLength={MAX_LENGTH}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit();
              }}
              aria-describedby="message-help"
              className="w-full px-4 py-3 bg-white border border-slate-400 rounded-sm text-base text-slate-900 placeholder-slate-500 focus:border-brand-green"
              placeholder={`Write to ${otherParty}…`}
            />
            {sendError && <p role="alert" className="text-sm text-rose-800">{sendError}</p>}
            <div className="flex items-center justify-between gap-3">
              <p id="message-help" className="text-xs text-slate-600">
                Never pay anyone for a job, interview or training. Report requests for money.
              </p>
              <Button
                type="submit"
                disabled={sending || !draft.trim()}
                icon={<Send className="w-4 h-4" aria-hidden="true" />}
                className="px-5 py-2.5 text-base shrink-0"
              >
                {sending ? "Sending…" : "Send"}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
