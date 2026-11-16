import { NextResponse } from "next/server";
import { getJobsByEmployer, isJobActive } from "@/lib/db/jobs";
import { getApplicationsByJobIds } from "@/lib/db/applications";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/** The signed-in employer's jobs with applicant counts. */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "EMPLOYER" && user.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: "Please sign in as an employer." }, { status: 401 });
    }

    const jobs = await getJobsByEmployer(user.id);
    const applications = await getApplicationsByJobIds(jobs.map((j) => j.id));

    return NextResponse.json({
      success: true,
      jobs: jobs.map((job) => {
        const forJob = applications.filter((a) => a.jobId === job.id);
        return {
          ...job,
          active: isJobActive(job),
          applicantCount: forJob.length,
          newApplicantCount: forJob.filter((a) => a.status === "SUBMITTED").length,
        };
      }),
    });
  } catch (error) {
    console.error("Failed to load employer jobs:", error);
    return NextResponse.json({ success: false, error: "Failed to load your jobs." }, { status: 500 });
  }
}
