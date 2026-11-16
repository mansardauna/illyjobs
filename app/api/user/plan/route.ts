import { NextResponse } from "next/server";
import { updateUserPlan, toSafeUser } from "@/lib/db/users";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Plan changes apply to the signed-in user only.
 *
 * Upgrading to PRO must follow a verified payment. Until a payment provider
 * (e.g. Paystack) is wired in, PRO upgrades are refused. For local demos only,
 * set ALLOW_UNPAID_UPGRADES=true (ignored in production).
 */
export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Please sign in to manage your plan." },
        { status: 401 }
      );
    }

    const { planTier } = await request.json();
    if (planTier !== "FREE" && planTier !== "PRO") {
      return NextResponse.json({ success: false, error: "Unknown plan." }, { status: 400 });
    }

    const demoUpgradesAllowed =
      process.env.NODE_ENV !== "production" && process.env.ALLOW_UNPAID_UPGRADES === "true";

    if (planTier === "PRO" && !demoUpgradesAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Online payment for Pro is not available yet. Please contact us to upgrade.",
        },
        { status: 402 }
      );
    }

    const updatedUser = await updateUserPlan(sessionUser.id, planTier);
    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: toSafeUser(updatedUser),
      message: `Account plan changed to ${planTier}.`,
    });
  } catch (error) {
    console.error("Plan change failed:", error);
    return NextResponse.json({ success: false, error: "Failed to change plan." }, { status: 500 });
  }
}
