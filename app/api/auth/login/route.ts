import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db/users";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your email and password." },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Account not found." },
        { status: 401 }
      );
    }

    // Omit sensitive data before returning
    const { passwordHash, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: `Welcome back, ${safeUser.fullName || safeUser.email}!`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
