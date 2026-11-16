import { NextResponse } from "next/server";
import { getJobById, getJobsByEmployer, getJobsByIds, isJobActive } from "@/lib/db/jobs";
import {
  AlreadyAppliedError,
  createApplication,
  getApplicationsByApplicant,
  getApplicationsByJobIds,
} from "@/lib/db/applications";
import { getThreadSummaries } from "@/lib/db/messages";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

/**
 * Job seekers get their own applications; employers get the applications to
 * their jobs (optionally one job with ?jobId=). Each comes with its job and
 * conversation summary.
 */
export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("Please sign in.", 401);

    const jobId = new URL(request.url).searchParams.get("jobId");

    let applications;
    let jobs;
    if (user.role === "JOB_SEEKER") {
      applications = await getApplicationsByApplicant(user.id);
      jobs = await getJobsByIds(applications.map((a) => a.jobId));
    } else {
      jobs = await getJobsByEmployer(user.id);
      if (jobId) jobs = jobs.filter((j) => j.id === jobId);
      applications = await getApplicationsByJobIds(jobs.map((j) => j.id));
    }

    const summaries = await getThreadSummaries(applications.map((a) => a.id), user.id);
    const jobsById = new Map(jobs.map((j) => [j.id, j]));

    return NextResponse.json({
      success: true,
      applications: applications.map((application) => {
        const job = jobsById.get(application.jobId);
        return {
          ...application,
          job: job
            ? { id: job.id, title: job.title, slug: job.slug, company: job.company, locationArea: job.locationArea }
            : null,
          unread: summaries[application.id]?.unread || 0,
          lastMessage: summaries[application.id]?.lastMessage || null,
        };
      }),
    });
  } catch (error) {
    console.error("Failed to load applications:", error);
    return fail("Failed to load applications.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("Please sign in or create a free account to apply.", 401);
    if (user.role !== "JOB_SEEKER") return fail("Only job seeker accounts can apply for jobs.", 403);

    const body = await request.json();
    const phone = String(body.applicantPhone || user.phone || "").trim();
    const name = String(body.applicantName || user.fullName || "").trim();
    if (!body.jobId || !name || !phone) {
      return fail("Please fill in your name and phone number.", 400);
    }

    const job = await getJobById(String(body.jobId));
    if (!job || !isJobActive(job)) return fail("This job is no longer accepting applications.", 404);

    const application = await createApplication({
      jobId: job.id,
      applicantId: user.id,
      applicantName: name.slice(0, 200),
      applicantEmail: user.email,
      applicantPhone: phone.slice(0, 40),
      locationArea: String(body.locationArea || user.locationArea || "Ilorin").slice(0, 100),
      // The CV attached is the one on the applicant's profile right now.
      resumePath: user.resumeUrl,
      resumeFileName: user.resumeFileName,
      coverNote: body.coverNote ? String(body.coverNote).slice(0, 5000) : undefined,
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    if (error instanceof AlreadyAppliedError) return fail(error.message, 409);
    console.error("Failed to submit application:", error);
    return fail("Failed to submit application.", 500);
  }
}
