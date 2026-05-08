import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Assignment from "@/models/Assignment";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get("subjectId");
        const courseId = searchParams.get("courseId");

        let query = {};
        if (subjectId) query.subjectId = subjectId;
        if (courseId) query.courseId = courseId;

        const assignments = await Assignment.find(query)
            .populate("courseId", "name")
            .populate("subjectId", "name")
            .sort({ createdAt: -1 });

        return NextResponse.json({ assignments });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
