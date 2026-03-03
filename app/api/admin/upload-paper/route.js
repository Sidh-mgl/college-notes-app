import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PreviousPaper from "@/models/PreviousPaper";
import cloudinary from "@/lib/cloudinary";

export const maxDuration = 60;

export async function POST(req) {
    try {
        await dbConnect();
        const formData = await req.formData();
        const file = formData.get("file");
        const title = formData.get("title");
        const courseId = formData.get("courseId");
        const subjectId = formData.get("subjectId");
        const year = formData.get("year");
        const section = formData.get("section");

        const courseName = formData.get("courseName") || "course";
        const subjectName = formData.get("subjectName") || "subject";

        if (!file || !title || !courseId || !subjectId || !year || !section) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Maintain Cloudinary folder structure
        const sanitizeName = (name) => name.replace(/[\s/]+/g, '-');
        const folderPath = `college-resources/${sanitizeName(courseName)}/${sanitizeName(subjectName)}/previous-papers/${year}/${sanitizeName(section)}`;

        const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folderPath,
                    resource_type: "raw",
                    use_filename: true,
                    unique_filename: true
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        const paper = await PreviousPaper.create({
            title,
            courseId,
            subjectId,
            year: parseInt(year),
            section,
            pdfUrl: uploadResponse.secure_url,
            publicId: uploadResponse.public_id,
        });

        return NextResponse.json({ success: true, paper }, { status: 201 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
