"use client";

import { useState } from "react";
import JobCard from "@/components/JobCard";
import ApplyModal from "@/components/ApplyModal";
import type { Job } from "@/lib/db/jobs";

interface JobGridProps {
  jobs: Job[];
  headingLevel?: "h2" | "h3";
  /** Shown when there are no jobs. */
  empty?: React.ReactNode;
}

/** Server-rendered list of job cards with the apply dialog attached. */
export default function JobGrid({ jobs, headingLevel = "h3", empty = null }: JobGridProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  if (jobs.length === 0) return <>{empty}</>;

  return (
    <>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.map((job) => (
          <li key={job.id} className="flex">
            <div className="w-full flex [&>article]:w-full">
              <JobCard job={job} onApplyClick={setSelectedJob} headingLevel={headingLevel} />
            </div>
          </li>
        ))}
      </ul>

      <ApplyModal job={selectedJob} isOpen={Boolean(selectedJob)} onClose={() => setSelectedJob(null)} />
    </>
  );
}
