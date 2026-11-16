"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import type { Job } from "@/lib/db/jobs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/constants";
import { formatSalaryShort, timeAgo } from "@/lib/format";

interface JobCardProps {
  job: Job;
  onApplyClick?: (job: Job) => void;
  /** Heading level for the job title, so cards fit the page outline. */
  headingLevel?: "h2" | "h3";
}

export default function JobCard({ job, onApplyClick, headingLevel = "h3" }: JobCardProps) {
  const Heading = headingLevel;

  const whatsappMessage = encodeURIComponent(
    `Hello, I saw your job post "${job.title}" on Illy Jobs and would like to apply.`
  );
  const whatsappUrl = job.whatsappPhone
    ? `https://wa.me/${job.whatsappPhone.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`
    : null;

  return (
    <article className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm hover:border-brand-green transition-colors flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="emerald">{job.locationArea}</Badge>
            <span className="text-slate-700 font-medium">
              {EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType}
            </span>
          </div>
          <time dateTime={job.postedAt} className="text-slate-600 font-normal shrink-0" suppressHydrationWarning>
            {timeAgo(job.postedAt)}
          </time>
        </div>

        <div className="pt-1">
          <Heading className="text-lg font-bold font-heading text-slate-900 leading-snug">
            <Link href={`/jobs/${job.slug}`} className="hover:underline hover:text-brand-green">
              {job.title}
            </Link>
          </Heading>
          <p className="text-sm font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
            <span>{job.company}</span>
            {job.isVerified && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Verified
              </span>
            )}
          </p>
        </div>

        <p className="text-sm font-bold text-slate-900 pt-1">
          {formatSalaryShort(job.salaryMin, job.salaryMax)}{" "}
          <span className="text-slate-600 font-normal text-xs">• {job.address || job.locationArea}</span>
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
        <Link href={`/jobs/${job.slug}`} className="text-sm font-bold text-slate-800 hover:text-brand-green py-1">
          View role<span className="sr-only">: {job.title} at {job.company}</span> →
        </Link>

        <div className="flex items-center gap-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-brand-light hover:bg-emerald-100 text-emerald-900 text-sm font-semibold rounded-sm border border-brand-green transition-colors"
            >
              WhatsApp
              <span className="sr-only"> {job.company} about {job.title} (opens in a new tab)</span>
            </a>
          )}

          {onApplyClick && (
            <Button type="button" onClick={() => onApplyClick(job)} className="px-3.5 py-1.5 text-sm font-semibold">
              Apply<span className="sr-only"> for {job.title} at {job.company}</span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
