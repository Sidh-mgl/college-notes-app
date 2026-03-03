import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";

export async function GET() {
    try {
        await dbConnect();
        const courses = await Course.find({}).sort({ name: 1 });
        return NextResponse.json({ courses });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
