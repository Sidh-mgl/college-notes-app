import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");

        if (!courseId) {
            return NextResponse.json({ error: "courseId is required" }, { status: 400 });
        }

        const subjects = await Subject.find({ courseId }).sort({ name: 1 });
        return NextResponse.json({ subjects });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
