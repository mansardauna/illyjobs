"use client";

import Link from "next/link";
import { Job } from "@/lib/db/jobs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface JobCardProps {
  job: Job & { isProEmployer?: boolean };
  onApplyClick?: (job: Job) => void;
}

export default function JobCard({ job, onApplyClick }: JobCardProps) {
  // Format salary cleanly
  const formatSalary = () => {
    if (job.salaryMin && job.salaryMax) {
      return `₦${(job.salaryMin / 1000).toFixed(0)}k - ₦${(job.salaryMax / 1000).toFixed(0)}k/mo`;
    }
    if (job.salaryMin) {
      return `From ₦${(job.salaryMin / 1000).toFixed(0)}k/mo`;
    }
    return "Negotiable";
  };

  // Time ago calculation
  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const whatsappMessage = encodeURIComponent(
    `Hello, I saw your job post "${job.title}" on Illy Jobs and would like to apply.`
  );
  const whatsappUrl = job.whatsappPhone
    ? `https://wa.me/${job.whatsappPhone.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`
    : null;

  return (
    <article className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm hover:border-brand-green transition-colors flex flex-col justify-between group">
      <div className="space-y-3">
        
        {/* Top Meta Line: Area & Time */}
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Badge variant="emerald">{job.locationArea}</Badge>
            <span className="text-slate-500 font-medium">
              {job.employmentType.replace("_", " ")}
            </span>
          </div>
          <span className="text-slate-400 font-normal">{getTimeAgo(job.postedAt)}</span>
        </div>

        {/* Title & Company */}
        <div className="pt-1">
          <h3 className="text-lg font-bold font-heading text-slate-900 group-hover:text-brand-green transition-colors leading-snug line-clamp-1">
            <Link href={`/jobs/${job.slug}`} className="focus:outline-none hover:underline">
              {job.title}
            </Link>
          </h3>
          <p className="text-sm font-medium text-slate-600 mt-0.5 flex items-center gap-1.5">
            <span>{job.company}</span>
            {job.isVerified && (
              <span className="w-2 h-2 rounded-full bg-brand-green" title="Verified Business" />
            )}
          </p>
        </div>

        {/* Salary & Location Subtext */}
        <p className="text-sm font-bold text-slate-900 pt-1">
          {formatSalary()} <span className="text-slate-400 font-normal text-xs">• {job.address || job.locationArea}</span>
        </p>

      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          href={`/jobs/${job.slug}`}
          className="text-xs font-bold text-slate-700 hover:text-brand-green"
        >
          View Role →
        </Link>

        <div className="flex items-center gap-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-brand-light hover:bg-emerald-100 text-emerald-900 text-xs font-semibold rounded-sm border border-brand-green transition-colors"
            >
              WhatsApp
            </a>
          )}

          <Button
            type="button"
            onClick={() => onApplyClick && onApplyClick(job)}
            className="px-3.5 py-1.5 text-xs font-semibold"
          >
            Apply Now
          </Button>
        </div>
      </div>
    </article>
  );
}
