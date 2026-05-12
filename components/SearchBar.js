"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState({ courses: [], subjects: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);

    // Debounce search
    useEffect(() => {
        if (!query.trim()) {
            setResults({ courses: [], subjects: [] });
            setIsOpen(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.results || { courses: [], subjects: [] });
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
                document.body.classList.remove('search-focused');
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const hasResults = results.courses.length > 0 || results.subjects.length > 0;

    // Text highlighter
    const highlightMatch = (text, q) => {
        if (!q) return text;
        const regex = new RegExp(`(${q})`, "gi");
        const parts = text.split(regex);
        return parts.map((part, i) => 
            regex.test(part) ? <span key={i} className="bg-yellow-200 text-yellow-900 font-semibold">{part}</span> : part
        );
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-2xl mx-auto mt-8 z-50 text-left">
            <div className="relative flex items-center w-full h-14 rounded-full focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white dark:bg-[#1E1E1E] overflow-hidden border border-gray-200 dark:border-gray-700 transition-shadow">
                <div className="grid place-items-center h-full w-14 text-gray-300 dark:text-gray-600">
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5 text-indigo-500" /> : <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
                </div>
                <input
                    className="peer h-full w-full outline-none text-gray-700 dark:text-gray-200 pr-6 bg-transparent text-lg placeholder-gray-400 dark:placeholder-gray-500"
                    type="text"
                    id="search"
                    placeholder="Search for subjects (e.g., DBMS) or courses..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (query.trim()) setIsOpen(true);
                        document.body.classList.add('search-focused');
                    }}
                    onBlur={() => {
                        // Delay removing the class slightly to allow clicking dropdown items
                        setTimeout(() => {
                            document.body.classList.remove('search-focused');
                        }, 200);
                    }}
                    autoComplete="off"
                />
            </div>

            {isOpen && (query.trim().length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden max-h-[28rem] overflow-y-auto transform origin-top transition-all duration-200">
                    {!isLoading && !hasResults ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <Search className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            No results found for &quot;{query}&quot;
                        </div>
                    ) : (
                        <div className="py-2">
                            {results.courses.length > 0 && (
                                <div className="mb-2">
                                    <h3 className="px-6 py-2 text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider bg-gray-50/80 dark:bg-[#222222]/80">Courses</h3>
                                    <ul className="py-1">
                                        {results.courses.map(course => (
                                            <li key={course._id}>
                                                <Link 
                                                    href={`/courses/${course._id}`}
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        document.body.classList.remove('search-focused');
                                                    }}
                                                    className="block px-6 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 transition-colors font-medium border-l-4 border-transparent hover:border-indigo-500"
                                                >
                                                    {highlightMatch(course.name, query)}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {results.subjects.length > 0 && (
                                <div>
                                    <h3 className="px-6 py-2 text-xs font-bold text-purple-500 dark:text-purple-400 uppercase tracking-wider bg-gray-50/80 dark:bg-[#222222]/80">Subjects</h3>
                                    <ul className="py-1">
                                        {results.subjects.map(subject => (
                                            <li key={subject._id}>
                                                <Link 
                                                    href={`/courses/${subject.courseId}/${subject._id}`}
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        document.body.classList.remove('search-focused');
                                                    }}
                                                    className="block px-6 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300 transition-colors font-medium border-l-4 border-transparent hover:border-purple-500"
                                                >
                                                    {highlightMatch(subject.name, query)}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
