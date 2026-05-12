"use client";

import Image from "next/image";
import { Inter } from "next/font/google";
import { Linkedin, Globe, Github } from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function Developer() {
  return (
    <div className={`flex flex-col md:flex-row justify-center items-center gap-8 py-10 px-4 ${inter.className}`}>
      {/* Sidh Mangal Card */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-[2rem] shadow-xl overflow-hidden w-full max-w-[320px] flex flex-col items-center">
        {/* Image Section */}
        <div className="w-full h-[320px] relative bg-gray-100 dark:bg-gray-800 group cursor-pointer overflow-hidden">
          <Image
            src="/image1.png"
            alt="Sidh Mangal"
            fill
            className="object-cover transition-opacity duration-500 ease-in-out z-10 group-hover:opacity-0"
          />
          <Image
            src="/image2.png"
            alt="Sidh Mangal Hover"
            fill
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          />
        </div>

        {/* Content Section */}
        <div className="py-8 px-6 flex flex-col items-center text-center w-full">
          <p className="text-gray-600 dark:text-gray-400 font-medium text-[16px] mb-2">
            managed and developed by
          </p>
          <h3 className="text-[22px] font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-wide uppercase">
            Sidh Mangal
          </h3>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 w-full">
            <a
              href="https://www.linkedin.com/in/sidhmangal20/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white dark:hover:bg-[#0A66C2] dark:hover:border-[#0A66C2] dark:hover:text-white transition-all duration-300"
            >
              <Linkedin className="w-5 h-5 fill-current" />
            </a>
            <a
              href="https://x.com/sidh_mangal"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-black hover:border-black hover:text-white dark:hover:bg-white dark:hover:border-white dark:hover:text-black transition-all duration-300"
            >
              {/* Custom X Icon */}
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
            </a>
            <a
              href="https://sidhportfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-[#4f46e5] hover:border-[#4f46e5] hover:text-white dark:hover:bg-[#6366f1] dark:hover:border-[#6366f1] dark:hover:text-white transition-all duration-300"
            >
              <Globe className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/Sidh-mgl"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-[#24292e] hover:border-[#24292e] hover:text-white dark:hover:bg-white dark:hover:border-white dark:hover:text-black transition-all duration-300"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Mohit Sharma Card */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-[2rem] shadow-xl overflow-hidden w-full max-w-[320px] flex flex-col items-center">
        {/* Image Section */}
        <div className="w-full h-[320px] relative bg-gray-100 dark:bg-gray-800 group cursor-pointer overflow-hidden">
          <Image
            src="/m-image1.png"
            alt="Mohit Sharma"
            fill
            className="object-cover transition-opacity duration-500 ease-in-out z-10 group-hover:opacity-0"
          />
          <Image
            src="/m-image2.png"
            alt="Mohit Sharma Hover"
            fill
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          />
        </div>

        {/* Content Section */}
        <div className="py-8 px-6 flex flex-col items-center text-center w-full">
          <p className="text-gray-600 dark:text-gray-400 font-medium text-[16px] mb-2">
            co-creator
          </p>
          <h3 className="text-[22px] font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-wide uppercase">
            Mohit Sharma
          </h3>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 w-full">
            <a
              href="https://www.linkedin.com/in/mohitsharma-cse"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white dark:hover:bg-[#0A66C2] dark:hover:border-[#0A66C2] dark:hover:text-white transition-all duration-300"
            >
              <Linkedin className="w-5 h-5 fill-current" />
            </a>
            <a
              href="https://x.com/legendgamingms"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-black hover:border-black hover:text-white dark:hover:bg-white dark:hover:border-white dark:hover:text-black transition-all duration-300"
            >
              {/* Custom X Icon */}
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
            </a>
            <a
              href="https://github.com/mohitsharma-cse"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-[#24292e] hover:border-[#24292e] hover:text-white dark:hover:bg-white dark:hover:border-white dark:hover:text-black transition-all duration-300"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
