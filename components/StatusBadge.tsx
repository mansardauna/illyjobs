import { STATUS_LABELS, type ApplicationStatus } from "@/lib/constants";

const STYLES: Record<ApplicationStatus, string> = {
  SUBMITTED: "bg-slate-100 text-slate-800 border-slate-300",
  REVIEWED: "bg-sky-50 text-sky-900 border-sky-300",
  SHORTLISTED: "bg-amber-50 text-amber-900 border-amber-300",
  INTERVIEW: "bg-violet-50 text-violet-900 border-violet-300",
  HIRED: "bg-emerald-50 text-emerald-900 border-emerald-400",
  REJECTED: "bg-rose-50 text-rose-900 border-rose-300",
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold border rounded-sm ${STYLES[status]}`}>
      <span className="sr-only">Status: </span>
      {STATUS_LABELS[status]}
    </span>
  );
}
