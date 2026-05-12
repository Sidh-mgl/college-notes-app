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

    if (userId === payload.userId) {
      return NextResponse.json({ error: "Self-demotion is not allowed" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "superadmin") {
      const superAdminCount = await User.countDocuments({ role: "superadmin" });
      if (superAdminCount <= 1) {
        return NextResponse.json({ error: "Cannot remove the last superadmin" }, { status: 400 });
      }
    }

    user.role = "user";
    user.isApproved = false;
    await user.save();

    return NextResponse.json({ message: "Admin role removed successfully" });
  } catch (error) {
    console.error("Remove admin error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
