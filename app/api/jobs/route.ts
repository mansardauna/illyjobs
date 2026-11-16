import { NextResponse } from "next/server";
import { getJobs, createJob, countActiveJobsByEmployer } from "@/lib/db/jobs";
import { getSessionUser } from "@/lib/auth/session";
import { FREE_EMPLOYER_JOB_LIMIT } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || undefined;
  const locationArea = searchParams.get("location") || undefined;
  const category = searchParams.get("category") || undefined;
  const employmentType = searchParams.get("type") || undefined;

  try {
    const jobs = await getJobs({ query, locationArea, category, employmentType });
    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const employer = await getSessionUser();
    if (!employer || (employer.role !== "EMPLOYER" && employer.role !== "ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Please sign in with an employer account to post a job." },
        { status: 401 }
      );
    }

    const isPro = employer.planTier === "PRO" || employer.role === "ADMIN";
    if (!isPro && (await countActiveJobsByEmployer(employer.id)) >= FREE_EMPLOYER_JOB_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: `Free plan limit reached (${FREE_EMPLOYER_JOB_LIMIT} live jobs). Upgrade to Employer Pro for unlimited postings.`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const company = employer.companyName || body.company;

    // Basic validation
    if (!body.title || !company || !body.locationArea || !body.category || !body.description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newJob = await createJob({
      employerId: employer.id,
      title: body.title,
      company,
      companyLogo: employer.companyLogo || undefined,
      locationArea: body.locationArea,
      address: body.address || `${body.locationArea}, Ilorin, Kwara State`,
      category: body.category,
      employmentType: body.employmentType || "FULL_TIME",
      salaryMin: body.salaryMin ? Number(body.salaryMin) : undefined,
      salaryMax: body.salaryMax ? Number(body.salaryMax) : undefined,
      salaryCurrency: "NGN",
      description: body.description,
      requirements: Array.isArray(body.requirements)
        ? body.requirements
        : (body.requirements || "").split("\n").filter((r: string) => r.trim() !== ""),
      preferredChannel: body.preferredChannel || "PLATFORM",
      whatsappPhone: body.whatsappPhone || undefined,
      contactEmail: body.contactEmail || undefined,
      // Trust badges come from the account, never from the request body.
      isVerified: Boolean(employer.isVerified),
      isFeatured: isPro && Boolean(body.isFeatured),
      isProEmployer: isPro,
    });

    return NextResponse.json({ success: true, job: newJob });
  } catch (error) {
    console.error("Failed to create job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create job posting" },
      { status: 500 }
    );
  }
}
