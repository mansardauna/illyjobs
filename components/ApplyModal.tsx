"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle, Send } from "lucide-react";
import { Job } from "@/lib/db/jobs";
import { useAuth } from "@/lib/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import ResumeUploader from "@/components/ResumeUploader";

interface ApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplyModal({ job, isOpen, onClose }: ApplyModalProps) {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [locationArea, setLocationArea] = useState(user?.locationArea || "Tanke / Unilorin Axis");
  const [coverNote, setCoverNote] = useState("");
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || "");
  const [resumeFileName, setResumeFileName] = useState(user?.resumeFileName || "");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen || !job) return null;

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
          applicantEmail: email,
          applicantPhone: phone,
          locationArea,
          coverNote,
          resumeUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setErrorMessage(data.error || "Failed to submit application.");
      }
    } catch (err) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setErrorMessage("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetForm}
      title={success ? undefined : `Apply for ${job.title}`}
      subtitle={success ? undefined : `${job.company} • ${job.locationArea}`}
    >
      {success ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-extrabold font-heading text-slate-900">Application Submitted!</h3>
          <p className="text-sm text-slate-600">
            Your application for <strong className="text-slate-900">{job.title}</strong> at{" "}
            <strong className="text-slate-900">{job.company}</strong> has been received.
          </p>
          <Button type="button" onClick={resetForm} className="px-6 py-2.5">
            Done & Return
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-sm text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Full Name *"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Ibrahim Abubakar"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ibrahim@example.com"
            />

            <Input
              label="WhatsApp / Phone *"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0803 000 0000"
            />
          </div>

          <ResumeUploader
            initialFileUrl={resumeUrl}
            initialFileName={resumeFileName}
            onFileSelect={(url, name) => {
              setResumeUrl(url);
              setResumeFileName(name);
            }}
          />

          <div className="space-y-1">
            <label htmlFor="coverNote" className="block text-sm font-bold text-slate-800">
              Cover Note / Experience Summary
            </label>
            <textarea
              id="coverNote"
              rows={3}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Briefly state your qualifications or why you are a fit for this role in Ilorin..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-sm text-base text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-green"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              icon={<Send className="w-4 h-4" />}
              className="w-full py-3 text-base"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
