import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PreviousPaper from "@/models/PreviousPaper";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get("subjectId");
        const year = searchParams.get("year");

        if (!subjectId || !year) {
            return NextResponse.json({ error: "subjectId and year are required" }, { status: 400 });
        }

        const papers = await PreviousPaper.find({ subjectId, year: parseInt(year) })
            .sort({ createdAt: -1 });

        return NextResponse.json({ papers });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
