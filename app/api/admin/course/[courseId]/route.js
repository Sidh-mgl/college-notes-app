import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Subject from "@/models/Subject";
import Note from "@/models/Note";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { courseId } = await params;

        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // Find all notes for this course to delete from Cloudinary
        const notes = await Note.find({ courseId });
        for (const note of notes) {
            if (note.publicId) {
                await cloudinary.uploader.destroy(note.publicId, { resource_type: "raw" });
            }
        }

        // Cascading deletes
        await Note.deleteMany({ courseId });
        await Subject.deleteMany({ courseId });
        await Course.findByIdAndDelete(courseId);

        return NextResponse.json({ success: true, message: "Course and related data deleted successfully" });
    } catch (error) {
        console.error("Delete Course Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
