import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get("subjectId");

        let query = {};
        if (subjectId) query.subjectId = subjectId;

        const notes = await Note.find(query)
            .populate("courseId", "name")
            .populate("subjectId", "name")
            .sort({ createdAt: -1 });

        return NextResponse.json({ notes });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
