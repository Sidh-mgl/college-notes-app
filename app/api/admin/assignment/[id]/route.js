import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Assignment from "@/models/Assignment";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const assignment = await Assignment.findById(id);

        if (!assignment) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }

        // Delete from Cloudinary
        if (assignment.publicId) {
            // resource_type MUST be "raw" for PDFs using upload_stream with raw type initially
            await cloudinary.uploader.destroy(assignment.publicId, { resource_type: "raw" });
        }

        await Assignment.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: "Assignment deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
