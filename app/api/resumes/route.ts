import { NextResponse } from "next/server";
import { getSeekerResumes } from "@/lib/db/users";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationArea = searchParams.get("location") || undefined;
  const query = searchParams.get("query") || undefined;

  try {
    const resumes = await getSeekerResumes(locationArea, query);
    const safeResumes = resumes.map(({ passwordHash, ...user }) => user);

    return NextResponse.json({ success: true, resumes: safeResumes });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch candidate resumes" },
      { status: 500 }
    );
  }
}
