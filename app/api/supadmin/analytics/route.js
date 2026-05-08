import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Note from "@/models/Note";
import User from "@/models/User";
import Course from "@/models/Course";
import { verifyToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        await connectDB();

        // Admin Token verification
        const token = req.cookies.get("admin_token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "superadmin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const pipeline = [
            // Notes
            { $match: { uploadedBy: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: { adminId: "$uploadedBy", courseId: "$courseId" },
                    notesCount: { $sum: 1 },
                    papersCount: { $sum: 0 },
                    assignmentsCount: { $sum: 0 }
                }
            },
            // Union with Assignments
            {
                $unionWith: {
                    coll: "assignments",
                    pipeline: [
                        { $match: { uploadedBy: { $exists: true, $ne: null } } },
                        {
                            $group: {
                                _id: { adminId: "$uploadedBy", courseId: "$courseId" },
                                notesCount: { $sum: 0 },
                                papersCount: { $sum: 0 },
                                assignmentsCount: { $sum: 1 }
                            }
                        }
                    ]
                }
            },
            // Union with Previous Papers
            {
                $unionWith: {
                    coll: "previouspapers",
                    pipeline: [
                        { $match: { uploadedBy: { $exists: true, $ne: null } } },
                        {
                            $group: {
                                _id: { adminId: "$uploadedBy", courseId: "$courseId" },
                                notesCount: { $sum: 0 },
                                papersCount: { $sum: 1 },
                                assignmentsCount: { $sum: 0 }
                            }
                        }
                    ]
                }
            },
            // Merge the grouped results
            {
                $group: {
                    _id: "$_id",
                    notesCount: { $sum: "$notesCount" },
                    papersCount: { $sum: "$papersCount" },
                    assignmentsCount: { $sum: "$assignmentsCount" }
                }
            },
            // Lookup Users
            {
                $lookup: {
                    from: "users",
                    localField: "_id.adminId",
                    foreignField: "_id",
                    as: "admin"
                }
            },
            // Lookup Courses
            {
                $lookup: {
                    from: "courses",
                    localField: "_id.courseId",
                    foreignField: "_id",
                    as: "course"
                }
            },
            { $unwind: { path: "$admin", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
            // Format Output
            {
                $project: {
                    _id: 0,
                    admin: { name: "$admin.name", email: "$admin.email" },
                    course: { name: "$course.name" },
                    notesCount: 1,
                    papersCount: 1,
                    assignmentsCount: 1,
                    totalUploads: { $add: ["$notesCount", "$papersCount", "$assignmentsCount"] }
                }
            },
            { $sort: { totalUploads: -1 } }
        ];

        const analytics = await Note.aggregate(pipeline);

        return NextResponse.json({ success: true, data: analytics });

    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
