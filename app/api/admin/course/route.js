import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";

export async function POST(req) {
    try {
        await dbConnect();
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Course name is required" }, { status: 400 });
        }

        const course = await Course.create({ name });
        return NextResponse.json({ success: true, course }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
