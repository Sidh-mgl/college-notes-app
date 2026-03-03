import Link from "next/link";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import Subject from "@/models/Subject";
import { ArrowLeft, BookOpen } from "lucide-react";
import SubjectView from "./SubjectView";

export const dynamic = "force-dynamic";

async function getNotes(subjectId) {
    try {
        await dbConnect();
        const notes = await Note.find({ subjectId }).sort({ createdAt: -1 }).lean();
        const subject = await Subject.findById(subjectId).populate("courseId", "name").lean();
        return { notes: JSON.parse(JSON.stringify(notes)), subject: JSON.parse(JSON.stringify(subject)) };
    } catch (e) {
        return { notes: [], subject: null };
    }
}

export default async function SubjectNotesPage({ params }) {
    const { courseId, subjectId } = await params;
    const { notes, subject } = await getNotes(subjectId);

    if (!subject) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-12 bg-white rounded-3xl shadow-xl">
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Subject not found</h2>
                    <Link href={`/courses/${courseId}`} className="text-indigo-600 hover:underline">Return to Subjects</Link>
                </div>
            </div>
        );
    }

    return (
        <SubjectView
            courseId={courseId}
            subjectId={subjectId}
            subject={subject}
            initialNotes={notes}
        />
    );
}
