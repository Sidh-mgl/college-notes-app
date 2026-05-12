import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden: Only superadmin can access users list" }, { status: 403 });
    }

    await connectDB();
    const users = await User.find({}, { name: 1, email: 1, role: 1, isApproved: 1, _id: 1 }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        name: user.name || "",
        email: user.email || "",
      })),
    });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
