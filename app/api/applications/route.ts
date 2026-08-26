import { NextResponse } from "next/server";
import { submitApplication } from "@/lib/db/jobs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.jobId || !body.applicantName || !body.applicantEmail || !body.applicantPhone) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required applicant details." },
        { status: 400 }
      );
    }

    const application = await submitApplication({
      jobId: body.jobId,
      applicantName: body.applicantName,
      applicantEmail: body.applicantEmail,
      applicantPhone: body.applicantPhone,
      locationArea: body.locationArea || "Ilorin",
      resumeUrl: body.resumeUrl || undefined,
      coverNote: body.coverNote || undefined,
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
