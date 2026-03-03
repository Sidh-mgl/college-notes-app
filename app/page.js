import Link from "next/link";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

async function getCourses() {
  await dbConnect();
  const courses = await Course.find({}).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(courses));
}

export default async function Home() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 sm:p-20 font-sans">
      <main className="max-w-5xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight mb-4">
            College Notes Archive
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Browse and download high-quality lecture notes organized by course, subject, and teacher.
          </p>
        </header>

        {courses.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/40 shadow-xl">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600">No courses available yet</h3>
            <p className="text-gray-400 mt-2">Check back later for updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Link key={course._id} href={`/courses/${course._id}`}>
                <div className="group relative bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-white/60 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col justify-between hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)]">
                  <div>
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                      {course.name}
                    </h2>
                  </div>
                  <div className="mt-6 flex items-center text-indigo-500 font-semibold text-sm">
                    View Subjects <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
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
