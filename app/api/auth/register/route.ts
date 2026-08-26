import { NextResponse } from "next/server";
import { registerUser } from "@/lib/db/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.email || !body.password || !body.role) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required registration fields." },
        { status: 400 }
      );
    }

    const newUser = await registerUser({
      email: body.email,
      password: body.password,
      role: body.role,
      fullName: body.fullName,
      companyName: body.companyName,
      phone: body.phone,
      locationArea: body.locationArea,
    });

    const { passwordHash, ...safeUser } = newUser;

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: "Account created successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Registration failed." },
      { status: 400 }
    );
  }
}
