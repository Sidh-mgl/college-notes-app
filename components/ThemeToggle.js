"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Don't render icons until mounted to prevent hydration errors, but render the button shape to prevent layout shifts.
  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#1E1E1E] dark:bg-white shadow-lg opacity-0 hide-on-search-mobile" aria-hidden="true"></div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`
        fixed bottom-6 right-6 z-50 flex items-center justify-center hide-on-search-mobile
        h-14 w-14 rounded-full shadow-lg transition-all duration-300 ease-in-out
        hover:scale-110 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-700
        ${isDark ? 'bg-white text-[#1E1E1E]' : 'bg-[#1E1E1E] text-white'}
      `}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Sun Icon (Visible in Dark Mode) */}
        <Sun 
          className={`absolute transition-all duration-500 ease-in-out ${
            isDark 
              ? "opacity-100 rotate-0 scale-100" 
              : "opacity-0 inset-0 -rotate-90 scale-50"
          }`} 
          size={24} 
        />
        {/* Moon Icon (Visible in Light Mode) */}
        <Moon 
          className={`absolute transition-all duration-500 ease-in-out ${
            isDark 
              ? "opacity-0 inset-0 rotate-90 scale-50" 
              : "opacity-100 rotate-0 scale-100"
          }`} 
          size={24} 
        />
      </div>
    </button>
  );
}
