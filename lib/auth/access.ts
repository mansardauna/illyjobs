import type { SafeUser } from "@/lib/db/users";
import { getApplicationById, type Application } from "@/lib/db/applications";
import { getJobById, type Job } from "@/lib/db/jobs";

export interface ApplicationAccess {
  application: Application;
  job: Job;
  /** How the signed-in user relates to this application. */
  role: "APPLICANT" | "EMPLOYER";
}

/**
 * Loads an application only if the user is its applicant or the employer who
 * owns the job (admins count as the employer). Returns null otherwise.
 */
export async function getApplicationAccess(user: SafeUser, applicationId: string): Promise<ApplicationAccess | null> {
  const application = await getApplicationById(applicationId);
  if (!application) return null;
  const job = await getJobById(application.jobId);
  if (!job) return null;

  if (application.applicantId === user.id) return { application, job, role: "APPLICANT" };
  if (user.role === "ADMIN" || (job.employerId && job.employerId === user.id)) {
    return { application, job, role: "EMPLOYER" };
  }
  return null;
}
