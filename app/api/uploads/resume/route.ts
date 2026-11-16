import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { toSafeUser, updateUserResume } from "@/lib/db/users";
import { InvalidResumeError, MAX_RESUME_BYTES, saveResume } from "@/lib/storage/resumes";

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

/** Uploads a CV to private storage and sets it as the CV on the user's profile. */
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("Please sign in to upload your CV.", 401);
    if (user.role !== "JOB_SEEKER") return fail("Only job seekers can upload a CV.", 403);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("No file was uploaded.", 400);
    if (file.size > MAX_RESUME_BYTES) return fail("File size exceeds the 5MB limit.", 400);

    const fileName = file.name.replace(/[^\w.\- ()]/g, "_").slice(0, 120) || "resume";
    const storagePath = await saveResume(user.id, fileName, Buffer.from(await file.arrayBuffer()));
    const updated = await updateUserResume(user.id, storagePath, fileName);
    if (!updated) return fail("User not found.", 404);

    return NextResponse.json({ success: true, user: toSafeUser(updated) });
  } catch (error) {
    if (error instanceof InvalidResumeError) return fail(error.message, 400);
    console.error("CV upload failed:", error);
    return fail("Upload failed. Please try again.", 500);
  }
}

/** Removes the CV from the profile. Past applications keep the copy they were sent with. */
export async function DELETE() {
  try {
    const user = await getSessionUser();
    if (!user) return fail("Please sign in.", 401);
    const updated = await updateUserResume(user.id, null, null);
    if (!updated) return fail("User not found.", 404);
    return NextResponse.json({ success: true, user: toSafeUser(updated) });
  } catch (error) {
    console.error("CV removal failed:", error);
    return fail("Could not remove your CV.", 500);
  }
}
