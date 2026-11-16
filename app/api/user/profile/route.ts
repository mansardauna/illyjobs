import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { toSafeUser, updateUserProfile, type ProfileUpdate } from "@/lib/db/users";
import { LOCATIONS } from "@/lib/constants";

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

function text(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.trim().slice(0, max);
}

/** Updates the signed-in user's own profile. Role, plan and verification cannot be changed here. */
export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("Please sign in.", 401);

    const body = await request.json();
    const changes: ProfileUpdate = {
      fullName: text(body.fullName, 120),
      phone: text(body.phone, 40),
      address: text(body.address, 200),
    };

    const locationArea = text(body.locationArea, 100);
    if (locationArea !== undefined) {
      if (!LOCATIONS.includes(locationArea)) return fail("Please choose an area from the list.", 400);
      changes.locationArea = locationArea;
    }

    if (user.role === "JOB_SEEKER") {
      changes.headline = text(body.headline, 160);
      if (Array.isArray(body.skills)) {
        changes.skills = body.skills
          .filter((s: unknown): s is string => typeof s === "string")
          .map((s: string) => s.trim().slice(0, 40))
          .filter(Boolean)
          .slice(0, 20);
      }
    } else {
      changes.companyName = text(body.companyName, 120);
      if (changes.companyName === "") return fail("Company name cannot be empty.", 400);
    }

    if (changes.fullName === "") return fail("Name cannot be empty.", 400);

    const updated = await updateUserProfile(user.id, changes);
    if (!updated) return fail("User not found.", 404);
    return NextResponse.json({ success: true, user: toSafeUser(updated) });
  } catch (error) {
    console.error("Profile update failed:", error);
    return fail("Could not save your profile.", 500);
  }
}
