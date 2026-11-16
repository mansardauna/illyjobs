import { NextResponse } from "next/server";
import { updateApplicationStatus } from "@/lib/db/applications";
import { createMessage } from "@/lib/db/messages";
import { getSessionUser } from "@/lib/auth/session";
import { getApplicationAccess } from "@/lib/auth/access";
import { APPLICATION_STATUSES, STATUS_LABELS, type ApplicationStatus } from "@/lib/constants";

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

/** The employer who owns the job moves an application through the pipeline. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("Please sign in.", 401);

    const access = await getApplicationAccess(user, params.id);
    if (!access) return fail("Application not found.", 404);
    if (access.role !== "EMPLOYER") return fail("Only the employer can change an application's status.", 403);

    const { status } = await request.json();
    if (!APPLICATION_STATUSES.includes(status)) return fail("Unknown status.", 400);

    if (status === access.application.status) {
      return NextResponse.json({ success: true, application: access.application });
    }

    const application = await updateApplicationStatus(params.id, status as ApplicationStatus);
    // Recorded in the conversation so the applicant is notified and has a history.
    await createMessage(
      params.id,
      user.id,
      `Application status changed to "${STATUS_LABELS[status as ApplicationStatus]}".`,
      "STATUS"
    );

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Failed to update application:", error);
    return fail("Failed to update application.", 500);
  }
}
