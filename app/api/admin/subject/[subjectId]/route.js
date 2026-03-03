import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Note from "@/models/Note";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { subjectId } = await params;

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        // Find all notes for this subject to delete from Cloudinary
        const notes = await Note.find({ subjectId });
        for (const note of notes) {
            if (note.publicId) {
                await cloudinary.uploader.destroy(note.publicId, { resource_type: "raw" });
            }
        }

        // Cascading deletes
        await Note.deleteMany({ subjectId });
        await Subject.findByIdAndDelete(subjectId);

        return NextResponse.json({ success: true, message: "Subject and related notes deleted successfully" });
    } catch (error) {
        console.error("Delete Subject Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
