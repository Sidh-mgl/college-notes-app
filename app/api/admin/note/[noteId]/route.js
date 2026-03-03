import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { noteId } = await params;

        const note = await Note.findById(noteId);
        if (!note) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        // Delete from Cloudinary
        if (note.publicId) {
            await cloudinary.uploader.destroy(note.publicId, { resource_type: "raw" });
        }

        // Delete from DB
        await Note.findByIdAndDelete(noteId);

        return NextResponse.json({ success: true, message: "Note deleted successfully" });
    } catch (error) {
        console.error("Delete Note Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
