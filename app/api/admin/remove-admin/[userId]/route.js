import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req, { params }) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden: Requires superadmin role" }, { status: 403 });
    }

    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectDB();
    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userToUpdate.role === "superadmin") {
      return NextResponse.json({ error: "Cannot modify a superadmin's role" }, { status: 403 });
    }

    userToUpdate.role = "user";
    await userToUpdate.save();

    return NextResponse.json({ message: "Admin role removed successfully" });
  } catch (error) {
    console.error("Remove admin error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
