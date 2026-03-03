import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PreviousPaper from "@/models/PreviousPaper";

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const { paperId } = await params;

        const paper = await PreviousPaper.findByIdAndUpdate(
            paperId,
            { $inc: { downloadCount: 1 } },
            { new: true }
        );

        if (!paper) {
            return NextResponse.json({ error: "Paper not found" }, { status: 404 });
        }

        return NextResponse.json({ url: paper.pdfUrl });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
