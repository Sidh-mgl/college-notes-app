import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import Subject from "@/models/Subject";
import NoteList from "./NoteList";

export const dynamic = "force-dynamic";

export default async function NotesPage({ params }) {
    const { courseId, subjectId, teacherName } = await params;
    const decodedTeacher = decodeURIComponent(teacherName);

    await dbConnect();
    const notes = await Note.find({ subjectId, teacherName: decodedTeacher }).sort({ createdAt: -1 }).lean();
    let subject = null;

    try {
        subject = await Subject.findById(subjectId).populate("courseId", "name").lean();
    } catch (e) { }

    return (
        <NoteList
            courseId={courseId}
            subjectId={subjectId}
            teacherName={decodedTeacher}
            subject={subject ? JSON.parse(JSON.stringify(subject)) : null}
            initialNotes={JSON.parse(JSON.stringify(notes))}
        />
    );
}
