"use client";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function Contributor() {
  return (
    <div
      className={`flex justify-center items-center py-10 my-12 px-4 ${inter.className}`}
    >
      <div className="relative py-16 px-10 md:py-20 md:px-24 w-full text-center flex flex-col items-center">
        {/* Top-left corner border */}
        <div className="absolute top-0 left-0 w-12 h-12 md:w-20 md:h-20 border-t-[4px] border-l-[4px] border-[#ff4da6] rounded-tl-[1.5rem]"></div>

        {/* Bottom-right corner border */}
        <div className="absolute bottom-0 right-0 w-12 h-12 md:w-20 md:h-20 border-b-[4px] border-r-[4px] border-[#ff4da6] rounded-br-[1.5rem]"></div>

        <h3 className="text-xl md:text-3xl lg:text-4xl font-semibold text-black dark:text-white tracking-tight leading-tight mb-6 max-w-4xl text-balance mx-auto">
          Contributing to the academic context and structural foundation of the project
        </h3>

        <p className="text-lg md:text-xl font-extrabold text-gray-800 dark:text-gray-200 tracking-wide mt-2">
          — Dr Nirmala Saini
        </p>
      </div>
    </div>
  );
}
