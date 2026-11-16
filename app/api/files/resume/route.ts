import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getApplicationAccess } from "@/lib/auth/access";
import { getUserById } from "@/lib/db/users";
import { getResumeDownload } from "@/lib/storage/resumes";

export const dynamic = "force-dynamic";

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

/**
 * Downloads a CV after checking who is asking:
 *  ?applicationId=  the applicant, or the employer who owns that job
 *  ?userId=         the user themself, or a Pro employer (resume database)
 */
export async function GET(request: Request) {
  try {
    const viewer = await getSessionUser();
    if (!viewer) return fail("Please sign in.", 401);

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");
    const userId = searchParams.get("userId");

    let storagePath: string | undefined;
    let fileName = "resume";

    if (applicationId) {
      const access = await getApplicationAccess(viewer, applicationId);
      if (!access) return fail("File not found.", 404);
      storagePath = access.application.resumePath;
      fileName = access.application.resumeFileName || fileName;
    } else if (userId) {
      const isSelf = userId === viewer.id;
      const isProEmployer = viewer.role === "EMPLOYER" && viewer.planTier === "PRO";
      if (!isSelf && !isProEmployer && viewer.role !== "ADMIN") return fail("File not found.", 404);
      const owner = await getUserById(userId);
      storagePath = owner?.resumeUrl;
      fileName = owner?.resumeFileName || fileName;
    } else {
      return fail("Missing applicationId or userId.", 400);
    }

    const download = storagePath ? await getResumeDownload(storagePath) : null;
    if (!download) return fail("File not found.", 404);

    if (download.kind === "redirect") return NextResponse.redirect(download.url);

    return new NextResponse(new Uint8Array(download.bytes), {
      headers: {
        "Content-Type": download.contentType,
        "Content-Disposition": `attachment; filename="${fileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("CV download failed:", error);
    return fail("Could not download the file.", 500);
  }
}
