import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const { noteId } = await params;

        const note = await Note.findByIdAndUpdate(
            noteId,
            { $inc: { downloadCount: 1 } },
            { new: true }
        );

        if (!note) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        return NextResponse.json({ url: note.pdfUrl });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
