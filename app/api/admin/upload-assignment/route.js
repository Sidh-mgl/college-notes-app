import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Assignment from "@/models/Assignment";
import cloudinary from "@/lib/cloudinary";
import { verifyToken } from "@/lib/jwt";

// Note: Azure App Service handles request timeouts via its own settings (default 230s).
// The Vercel-only `maxDuration` is not used here.

export async function POST(req) {
    try {
        await dbConnect();
        
        const token = req.cookies.get("admin_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded || !decoded.userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get("file");
        const title = formData.get("title");
        const courseId = formData.get("courseId");
        const subjectId = formData.get("subjectId");

        const courseName = formData.get("courseName") || "course";
        const subjectName = formData.get("subjectName") || "subject";

        if (!file || !title || !courseId || !subjectId) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Maintain Cloudinary folder structure
        const sanitizeName = (name) => name.replace(/[\s/]+/g, '-');
        const folderPath = `college-resources/${sanitizeName(courseName)}/${sanitizeName(subjectName)}/assignments`;

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

        const assignment = await Assignment.create({
            title,
            courseId,
            subjectId,
            pdfUrl: uploadResponse.secure_url,
            publicId: uploadResponse.public_id,
            uploadedBy: decoded.userId,
        });

        return NextResponse.json({ success: true, assignment }, { status: 201 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
