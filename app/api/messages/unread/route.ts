import { NextResponse } from "next/server";
import { getApplicationsByApplicant, getApplicationsByJobIds } from "@/lib/db/applications";
import { getJobsByEmployer } from "@/lib/db/jobs";
import { getThreadSummaries } from "@/lib/db/messages";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/** Total unread messages across the signed-in user's conversations. */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ success: true, count: 0 });

    const applications =
      user.role === "JOB_SEEKER"
        ? await getApplicationsByApplicant(user.id)
        : await getApplicationsByJobIds((await getJobsByEmployer(user.id)).map((j) => j.id));

    const summaries = await getThreadSummaries(applications.map((a) => a.id), user.id);
    const count = Object.values(summaries).reduce((total, s) => total + s.unread, 0);
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Failed to count unread messages:", error);
    return NextResponse.json({ success: false, count: 0 }, { status: 500 });
  }
}
