import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PreviousPaper from "@/models/PreviousPaper";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get("subjectId");

        if (!subjectId) {
            return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
        }

        const years = await PreviousPaper.distinct("year", { subjectId });
        // Sort descending
        years.sort((a, b) => b - a);

        return NextResponse.json({ years });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
