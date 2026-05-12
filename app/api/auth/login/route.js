import { NextResponse } from "next/server";
import { comparePassword } from "@/lib/password";
import { signToken } from "@/lib/jwt";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user || !["admin", "superadmin"].includes(user.role)) {
      return NextResponse.json(
        { message: "Invalid credentials or unauthorized" },
        { status: 401 }
      );
    }

    if (user.isTemporary && user.temporaryExpiresAt && user.temporaryExpiresAt <= new Date()) {
      await User.deleteOne({ _id: user._id });
      return NextResponse.json(
        { message: "Temporary admin expired" },
        { status: 401 }
      );
    }

    if (user.role === "admin" && !user.isApproved) {
      return NextResponse.json(
        { message: "Admin approval pending" },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set cookie
    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
