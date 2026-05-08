import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Course from "@/models/Course";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const keyword = searchParams.get("q");

        if (!keyword) {
            return NextResponse.json({ results: { courses: [], subjects: [] } });
        }

        // We use a simple case-insensitive regex search
        const cleanKeyword = keyword.replace(/\s+/g, ' ').trim();
        // Escape regex special characters to prevent errors
        const safeKeyword = cleanKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(safeKeyword, "i");

        // Limit results to optimize performance
        const subjects = await Subject.find({ name: { $regex: regex } })
            .limit(10)
            .lean();

        const courses = await Course.find({ name: { $regex: regex } })
            .limit(5)
            .lean();

        return NextResponse.json({ results: { courses, subjects } });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
