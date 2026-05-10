import Link from "next/link";
import { Inter } from "next/font/google";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import { BookOpen } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import ShareResources from "@/components/ShareResources";
import SubscribeSection from "@/components/SubscribeSection";
import ViewMoreButton from "@/components/ViewMoreButton";
import Developer from "@/components/Developer";
import Contributor from "@/components/Contributor";
import FloatingMascot from "@/components/FloatingMascot";

export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

async function getCourses() {
  try {
    await dbConnect();
    const courses = await Course.find({}).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(courses));
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return [];
  }
}

export default async function Home() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] to-[#fdf2f8] dark:from-gray-900 dark:via-[#121212] dark:to-gray-900 p-6 sm:p-12 overflow-x-hidden">
      {/* Floating Mascot */}
      <FloatingMascot />
      <main className="max-w-4xl mx-auto relative z-10">
        <header className="flex flex-col items-center text-center mb-12">
          <div className={`max-w-[700px] w-full px-4 flex flex-col items-center ${inter.className}`}>
            <h1 className="text-[40px] md:text-[48px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-500 tracking-[-0.5px] leading-[1.1]">
              JECRC Resources App
            </h1>
            <p className="mt-4 text-[16px] md:text-[18px] font-medium text-gray-800 dark:text-gray-200 leading-[1.7] tracking-wide max-w-max whitespace-normal md:whitespace-nowrap">
              Browse and download high-quality documents organized by courses and subjects
            </p>
            <p className="mt-3 text-[16px] md:text-[18px] font-medium text-gray-800 dark:text-gray-200 tracking-wide">
              Completely Free | No Signup Required
            </p>
          </div>
          
          <div className="mb-6 mt-6">
            <span className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-gray-100">
              All you need is{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10 text-[#ec4899]">
                  just search
                </span>
                {/* Hand-drawn Underline SVG */}
                <svg className="absolute w-[105%] h-4 -bottom-2 -left-[2.5%] text-[#ec4899] z-0" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path d="M 3 20 C 30 10, 70 12, 97 18" stroke="currentColor" strokeWidth="3" fill="transparent" strokeLinecap="round" />
                </svg>
                {/* Sparkles SVG */}
                <svg className="absolute -top-5 -right-8 w-8 h-8 text-[#ec4899] z-0" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                  <path d="M 14 16 L 17 5 M 22 21 L 32 13 M 24 30 L 36 29" />
                </svg>
              </span>
            </span>
          </div>

          <SearchBar />
        </header>

        {courses.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-[#1E1E1E]/50 backdrop-blur-sm rounded-3xl border border-white/40 dark:border-gray-800 shadow-xl">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">No courses available yet</h3>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Check back later for updates.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course) => (
                <Link key={course._id} href={`/courses/${course._id}`}>
                  <div className="group relative bg-white/70 dark:bg-[#1E1E1E]/70 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/60 dark:border-gray-700/60 transition-all duration-500 ease-out transform hover:-translate-y-2 hover:scale-[1.02] hover:border-indigo-500/30 dark:hover:border-indigo-400/30 cursor-pointer h-full flex flex-col justify-between hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.4)] overflow-hidden">
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 ease-out shadow-sm group-hover:shadow-md">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                        {course.name}
                      </h2>
                    </div>
                    <div className="relative z-10 mt-4 flex items-center text-indigo-500 dark:text-indigo-400 font-semibold text-xs transition-colors duration-300">
                      View Subjects <span className="ml-2 group-hover:translate-x-2 transition-transform duration-500 ease-out">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {courses.length > 6 && (
              <div className="mt-12 flex justify-center">
                <ViewMoreButton />
              </div>
            )}
          </>
        )}

        <div className="mt-32">
          <Developer />
        </div>
        
        <div className="mt-24">
          <Contributor />
        </div>

        <div className="mt-32 mb-6">
          <ShareResources />
        </div>

        <div className="mt-32 mb-6">
          <SubscribeSection source="homepage" />
        </div>

        <footer className="mt-16 pt-8 pb-10 border-t border-gray-200/50 dark:border-gray-800/50 flex flex-col items-center justify-center gap-1 text-center">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            crafted with love and efforts -
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            all copyright reserved{" "}
            <a
              href="https://linkedin.com/in/sidhmangal20/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200 underline decoration-indigo-300 dark:decoration-indigo-600/50 hover:decoration-indigo-600 underline-offset-4"
            >
              Sidh Mangal
            </a>{" "}
            &copy; all rights reserved
          </p>
        </footer>
      </main>
    </div>
  );
}
