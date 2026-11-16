import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Session lookup failed:", error);
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
