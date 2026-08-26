import { NextResponse } from "next/server";
import { getJobs, createJob } from "@/lib/db/jobs";

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
    const body = await request.json();

    // Basic validation
    if (!body.title || !body.company || !body.locationArea || !body.category || !body.description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newJob = await createJob({
      title: body.title,
      company: body.company,
      companyLogo: body.companyLogo || "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=120&h=120&q=80",
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
      isVerified: true, // Auto-verify for quick local testing
      isFeatured: Boolean(body.isFeatured),
    });

    return NextResponse.json({ success: true, job: newJob });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create job posting" },
      { status: 500 }
    );
  }
}
