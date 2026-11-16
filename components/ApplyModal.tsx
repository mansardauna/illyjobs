"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Send } from "lucide-react";
import type { Job } from "@/lib/db/jobs";
import { useAuth } from "@/lib/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AlertBanner } from "@/components/ui/AlertBanner";
import ResumeUploader from "@/components/ResumeUploader";

interface ApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplyModal({ job, isOpen, onClose }: ApplyModalProps) {
  const { user, loading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Prefill from the account each time the dialog opens.
  useEffect(() => {
    if (!isOpen) return;
    setFullName(user?.fullName || "");
    setPhone(user?.phone || "");
    setCoverNote("");
    setSuccess(false);
    setErrorMessage("");
  }, [isOpen, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || !job) return null;

  const next = encodeURIComponent(`/jobs/${job.slug}`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          applicantName: fullName,
          applicantPhone: phone,
          coverNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setErrorMessage(data.error || "Failed to submit application.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  let content: React.ReactNode;

  if (loading) {
    content = <p className="text-sm text-slate-700" role="status">Loading…</p>;
  } else if (!user) {
    content = (
      <div className="space-y-4">
        <p className="text-sm text-slate-700">
          Create a free account to apply. You will be able to track this application and message the
          employer from your dashboard.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/auth/register?next=${next}`} className="btn-primary text-center">
            Create free account
          </Link>
          <Link href={`/auth/login?next=${next}`} className="btn-secondary text-center">
            Sign in
          </Link>
        </div>
      </div>
    );
  } else if (user.role !== "JOB_SEEKER") {
    content = (
      <AlertBanner variant="warning">
        You are signed in with an employer account. Sign in with a job seeker account to apply for jobs.
      </AlertBanner>
    );
  } else if (success) {
    content = (
      <div className="text-center py-4 space-y-4" role="status">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto" aria-hidden="true">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-extrabold font-heading text-slate-900">Application submitted</h3>
        <p className="text-sm text-slate-700">
          Your application for <strong className="text-slate-900">{job.title}</strong> at{" "}
          <strong className="text-slate-900">{job.company}</strong> has been sent.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/dashboard" className="btn-primary text-center">
            Track my applications
          </Link>
          <Button type="button" variant="secondary" onClick={onClose} className="px-5 py-3 text-base">
            Close
          </Button>
        </div>
      </div>
    );
  } else {
    content = (
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && <AlertBanner variant="error">{errorMessage}</AlertBanner>}

        <Input
          label="Full name (required)"
          type="text"
          required
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="WhatsApp or phone number (required)"
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0803 000 0000"
          hint={`The employer will also see your email, ${user.email}.`}
        />

        <ResumeUploader label="CV / Resume (optional, PDF or Word)" />

        <div className="space-y-1">
          <label htmlFor="apply-cover-note" className="block text-sm font-bold text-slate-800">
            Cover note (optional)
          </label>
          <textarea
            id="apply-cover-note"
            rows={3}
            maxLength={5000}
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            placeholder="Briefly say why you are a good fit for this role."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-sm text-base text-slate-900 placeholder-slate-500 focus:bg-white focus:border-brand-green"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          icon={<Send className="w-4 h-4" aria-hidden="true" />}
          className="w-full py-3 text-base"
        >
          {submitting ? "Submitting…" : "Submit application"}
        </Button>
      </form>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={success ? undefined : `Apply for ${job.title}`}
      subtitle={success ? undefined : `${job.company} • ${job.locationArea}`}
      ariaLabel="Application submitted"
    >
      {content}
    </Modal>
  );
}
