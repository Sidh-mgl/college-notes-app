import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden: Superadmin only" }, { status: 403 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "admin" && !user.isApproved) {
      await User.findByIdAndDelete(userId);
      return NextResponse.json({ message: "Pending admin rejected and deleted" });
    } else {
      return NextResponse.json({ error: "User is not a pending admin" }, { status: 400 });
    }
  } catch (error) {
    console.error("Reject admin error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
