import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PreviousPaper from "@/models/PreviousPaper";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { paperId } = await params;

        const paper = await PreviousPaper.findById(paperId);
        if (!paper) {
            return NextResponse.json({ error: "Paper not found" }, { status: 404 });
        }

        // Delete from Cloudinary
        if (paper.publicId) {
            await cloudinary.uploader.destroy(paper.publicId, { resource_type: "raw" });
        }

        // Delete from DB
        await PreviousPaper.findByIdAndDelete(paperId);

        return NextResponse.json({ message: "Previous paper deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Delete paper error:", error);
        return NextResponse.json({ error: "Failed to delete paper" }, { status: 500 });
    }
}
