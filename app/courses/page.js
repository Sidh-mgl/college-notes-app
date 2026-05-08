import Link from "next/link";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import { BookOpen } from "lucide-react";
import SearchBar from "@/components/SearchBar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Courses - College Notes Archive",
  description: "Browse all courses and their study materials.",
};

async function getCourses() {
  await dbConnect();
  const courses = await Course.find({}).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(courses));
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-[#121212] dark:to-gray-900 p-8 sm:p-20">
      <main className="max-w-5xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight mb-4">
            All Courses
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Browse and download high-quality lecture notes organized by course, subject, and teacher.
          </p>
          <SearchBar />
        </header>

        {courses.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-[#1E1E1E]/50 backdrop-blur-sm rounded-3xl border border-white/40 dark:border-gray-800 shadow-xl">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">No courses available yet</h3>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Check back later for updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Link key={course._id} href={`/courses/${course._id}`}>
                <div className="group relative bg-white/70 dark:bg-[#1E1E1E]/70 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-white/60 dark:border-gray-700/60 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col justify-between hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)]">
                  <div>
                    <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {course.name}
                    </h2>
                  </div>
                  <div className="mt-6 flex items-center text-indigo-500 dark:text-indigo-400 font-semibold text-sm">
                    View Subjects <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <footer className="mt-16 text-center text-sm font-medium text-neutral-500 pb-2">
          &copy; 2026{" "}
          <a
            href="https://linkedin.com/in/sidhmangal20/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200 underline decoration-indigo-300 dark:decoration-indigo-600/50 hover:decoration-indigo-600 underline-offset-2"
          >
            Sidh Mangal
          </a>
          . All rights reserved.
        </footer>
      </main>
    </div>
  );
}
