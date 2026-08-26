import { NextResponse } from "next/server";
import { updateUserPlan } from "@/lib/db/users";

export async function POST(request: Request) {
  try {
    const { userId, planTier } = await request.json();

    if (!userId || !planTier) {
      return NextResponse.json(
        { success: false, error: "Invalid user or plan specification." },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserPlan(userId, planTier);

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    const { passwordHash, ...safeUser } = updatedUser;

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: `Account plan upgraded to ${planTier}!`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to upgrade plan." },
      { status: 500 }
    );
  }
}
