import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";

export async function POST(req) {
    try {
        await dbConnect();
        const { name, courseId } = await req.json();

        if (!name || !courseId) {
            return NextResponse.json({ error: "Name and courseId are required" }, { status: 400 });
        }

        const subject = await Subject.create({ name, courseId });
        return NextResponse.json({ success: true, subject }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
