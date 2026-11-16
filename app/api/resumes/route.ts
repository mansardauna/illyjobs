import { NextResponse } from "next/server";
import { getSeekerResumes, toSafeUser } from "@/lib/db/users";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationArea = searchParams.get("location") || undefined;
  const query = searchParams.get("query") || undefined;

  try {
    // Candidate CVs and contact details are for Pro employers only.
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "Please sign in." }, { status: 401 });
    }
    const allowed =
      sessionUser.role === "ADMIN" || (sessionUser.role === "EMPLOYER" && sessionUser.planTier === "PRO");
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "The resume database is available on Employer Pro." },
        { status: 403 }
      );
    }

    const resumes = await getSeekerResumes(locationArea, query);
    return NextResponse.json({ success: true, resumes: resumes.map(toSafeUser) });
  } catch (error) {
    console.error("Failed to fetch resumes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch candidate resumes" },
      { status: 500 }
    );
  }
}
