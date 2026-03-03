import Link from "next/link";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Course from "@/models/Course";
import { FolderOpen, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

async function getSubjects(courseId) {
    try {
        await dbConnect();
        const subjects = await Subject.find({ courseId }).sort({ name: 1 }).lean();
        const course = await Course.findById(courseId).lean();
        return { subjects: JSON.parse(JSON.stringify(subjects)), course: JSON.parse(JSON.stringify(course)) };
    } catch (e) {
        return { subjects: [], course: null };
    }
}

export default async function SubjectsPage({ params }) {
    const { courseId } = await params;
    const { subjects, course } = await getSubjects(courseId);

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-12 bg-white rounded-3xl shadow-xl">
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Course not found</h2>
                    <Link href="/" className="text-indigo-600 hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 sm:p-20 font-sans">
            <main className="max-w-5xl mx-auto">
                <Link href="/" className="inline-flex items-center text-gray-500 hover:text-indigo-600 font-medium mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
                </Link>
                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                        {course.name}
                    </h1>
                    <p className="text-lg text-gray-500">Select a subject to view teachers.</p>
                </header>

                {subjects.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/40 shadow-xl">
                        <h3 className="text-xl font-medium text-gray-600">No subjects available</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((subject) => (
                            <Link key={subject._id} href={`/courses/${courseId}/${subject._id}`}>
                                <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:border-purple-200">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-purple-100 text-purple-600 p-3 rounded-xl group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                            <FolderOpen className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                                            {subject.name}
                                        </h2>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
