import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Subject from "@/models/Subject";
import Note from "@/models/Note";
import PreviousPaper from "@/models/PreviousPaper";
import Assignment from "@/models/Assignment";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { courseId } = await params;

        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // Find all course resources to delete from Cloudinary
        const resources = [
            ...(await Note.find({ courseId })),
            ...(await PreviousPaper.find({ courseId })),
            ...(await Assignment.find({ courseId })),
        ];

        for (const resource of resources) {
            if (resource.publicId) {
                await cloudinary.uploader.destroy(resource.publicId, { resource_type: "raw" });
            }
        }

        // Cascading deletes
        await Note.deleteMany({ courseId });
        await PreviousPaper.deleteMany({ courseId });
        await Assignment.deleteMany({ courseId });
        await Subject.deleteMany({ courseId });
        await Course.findByIdAndDelete(courseId);

        return NextResponse.json({ success: true, message: "Course and related resources deleted successfully" });
    } catch (error) {
        console.error("Delete Course Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
