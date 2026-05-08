import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "superadmin") {
      return NextResponse.json({ message: "Forbidden: Superadmin only" }, { status: 403 });
    }

    await connectDB();
    const { userId } = params;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ message: "Only admins can be approved" }, { status: 400 });
    }

    user.isApproved = true;
    await user.save();

    return NextResponse.json({ message: "Admin approved successfully" });
  } catch (error) {
    console.error("Approve admin error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
