import { NextResponse } from "next/server";
import { EmailTakenError, registerUser, toSafeUser } from "@/lib/db/users";
import { setSessionCookie } from "@/lib/auth/session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (typeof body.email !== "string" || !EMAIL_PATTERN.test(body.email.trim())) {
      return bad("Please enter a valid email address.");
    }
    if (typeof body.password !== "string" || body.password.length < MIN_PASSWORD_LENGTH) {
      return bad(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    // Only these two roles can self-register; ADMIN is never accepted from the client.
    if (body.role !== "JOB_SEEKER" && body.role !== "EMPLOYER") {
      return bad("Please choose Job Seeker or Employer.");
    }
    if (body.role === "EMPLOYER" && !body.companyName) {
      return bad("Please enter your company name.");
    }

    const newUser = await registerUser({
      email: body.email,
      password: body.password,
      role: body.role,
      fullName: body.fullName ? String(body.fullName) : undefined,
      companyName: body.companyName ? String(body.companyName) : undefined,
      phone: body.phone ? String(body.phone) : undefined,
      locationArea: body.locationArea ? String(body.locationArea) : undefined,
    });

    setSessionCookie(newUser.id);

    return NextResponse.json({
      success: true,
      user: toSafeUser(newUser),
      message: "Account created successfully!",
    });
  } catch (error) {
    if (error instanceof EmailTakenError) return bad(error.message, 409);
    console.error("Registration failed:", error);
    return bad("Registration failed. Please try again.", 500);
  }
}
