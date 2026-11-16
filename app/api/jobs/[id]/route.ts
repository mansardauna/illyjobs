import { NextResponse } from "next/server";
import { countActiveJobsByEmployer, getJobById, isJobActive, updateJobStatus } from "@/lib/db/jobs";
import { getSessionUser } from "@/lib/auth/session";
import { FREE_EMPLOYER_JOB_LIMIT } from "@/lib/constants";

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

/** The owner closes a filled job, or reopens it for another 30 days. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("Please sign in.", 401);

    const job = await getJobById(params.id);
    const owns = job && (user.role === "ADMIN" || (job.employerId && job.employerId === user.id));
    if (!job || !owns) return fail("Job not found.", 404);

    const { status } = await request.json();
    if (status !== "OPEN" && status !== "CLOSED") return fail("Unknown status.", 400);

    const isPro = user.planTier === "PRO" || user.role === "ADMIN";
    if (status === "OPEN" && !isJobActive(job) && !isPro) {
      if ((await countActiveJobsByEmployer(user.id)) >= FREE_EMPLOYER_JOB_LIMIT) {
        return fail(
          `Free plan limit reached (${FREE_EMPLOYER_JOB_LIMIT} live jobs). Close another job or upgrade to Employer Pro.`,
          403
        );
      }
    }

    const updated = await updateJobStatus(params.id, status);
    return NextResponse.json({ success: true, job: updated });
  } catch (error) {
    console.error("Failed to update job:", error);
    return fail("Failed to update job.", 500);
  }
}
