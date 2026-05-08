import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Assignment from "@/models/Assignment";

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const { assignmentId } = await params;

        const assignment = await Assignment.findByIdAndUpdate(
            assignmentId,
            { $inc: { downloadCount: 1 } },
            { new: true }
        );

        if (!assignment) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }

        return NextResponse.json({ url: assignment.pdfUrl });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
