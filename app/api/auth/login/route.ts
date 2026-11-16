import { NextResponse } from "next/server";
import { getUserByEmail, toSafeUser } from "@/lib/db/users";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your email and password." },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    const passwordOk = await verifyPassword(password, user?.passwordHash);

    // Same message for unknown email and wrong password, so accounts can't be probed.
    if (!user || !passwordOk) {
      return NextResponse.json(
        { success: false, error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    setSessionCookie(user.id);
    const safeUser = toSafeUser(user);

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: `Welcome back, ${safeUser.fullName || safeUser.email}!`,
    });
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json(
      { success: false, error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
