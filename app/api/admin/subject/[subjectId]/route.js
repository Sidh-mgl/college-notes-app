import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Note from "@/models/Note";
import PreviousPaper from "@/models/PreviousPaper";
import Assignment from "@/models/Assignment";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { subjectId } = await params;

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        // Find all subject resources to delete from Cloudinary
        const resources = [
            ...(await Note.find({ subjectId })),
            ...(await PreviousPaper.find({ subjectId })),
            ...(await Assignment.find({ subjectId })),
        ];

        for (const resource of resources) {
            if (resource.publicId) {
                await cloudinary.uploader.destroy(resource.publicId, { resource_type: "raw" });
            }
        }

        // Cascading deletes
        await Note.deleteMany({ subjectId });
        await PreviousPaper.deleteMany({ subjectId });
        await Assignment.deleteMany({ subjectId });
        await Subject.findByIdAndDelete(subjectId);

        return NextResponse.json({ success: true, message: "Subject and related resources deleted successfully" });
    } catch (error) {
        console.error("Delete Subject Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
