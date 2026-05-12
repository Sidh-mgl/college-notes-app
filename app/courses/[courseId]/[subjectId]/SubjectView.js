"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Download, Loader2, BookOpen, Clock, ChevronDown } from "lucide-react";
import ShareResources from "@/components/ShareResources";

export default function SubjectView({ courseId, subjectId, subject, initialNotes }) {
    const [notes, setNotes] = useState(initialNotes || []);
    const [downloadingId, setDownloadingId] = useState(null);

    // Papers State
    const [activeTab, setActiveTab] = useState("papers"); // 'notes' or 'papers'
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [papers, setPapers] = useState([]);
    const [loadingPapers, setLoadingPapers] = useState(false);

    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [assignmentsFetched, setAssignmentsFetched] = useState(false);

    const PAPER_SECTIONS = ["In-Sem 1", "In-Sem 2", "In-Sem 3", "Back Paper", "End Sem Paper"];

    useEffect(() => {
        if (activeTab === "papers" && years.length === 0) {
            fetchYears();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    useEffect(() => {
        if (selectedYear) {
            fetchPapers(selectedYear);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYear]);

    useEffect(() => {
        if (activeTab === "assignments" && !assignmentsFetched) {
            fetchAssignments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, assignmentsFetched]);

    const fetchAssignments = async () => {
        setLoadingAssignments(true);
        try {
            const res = await fetch(`/api/assignments?subjectId=${subjectId}`);
            const data = await res.json();
            if (data.assignments) {
                setAssignments(data.assignments);
                setAssignmentsFetched(true);
            }
        } catch (e) {
            console.error("Failed to fetch assignments", e);
        } finally {
            setLoadingAssignments(false);
        }
    };

    const fetchYears = async () => {
        try {
            const res = await fetch(`/api/paper-years?subjectId=${subjectId}`);
            const data = await res.json();
            if (data.years) {
                setYears(data.years);
                if (data.years.length > 0) setSelectedYear(data.years[0]);
            }
        } catch (e) {
            console.error("Failed to fetch years", e);
        }
    };

    const fetchPapers = async (year) => {
        setLoadingPapers(true);
        try {
            const res = await fetch(`/api/papers?subjectId=${subjectId}&year=${year}`);
            const data = await res.json();
            if (data.papers) setPapers(data.papers);
        } catch (e) {
            console.error("Failed to fetch papers", e);
        } finally {
            setLoadingPapers(false);
        }
    };

    const handleDownload = async (id, pdfUrl, title, type = "note") => {
        try {
            setDownloadingId(id);

            let endpoint = `/api/download/${id}`;
            if (type === "paper") endpoint = `/api/download-paper/${id}`;
            if (type === "assignment") endpoint = `/api/download-assignment/${id}`;

            const res = await fetch(endpoint, { method: "POST" });
            const data = await res.json();

            if (res.ok) {
                if (type === "paper") {
                    setPapers((prev) => prev.map((p) => p._id === id ? { ...p, downloadCount: (p.downloadCount || 0) + 1 } : p));
                } else if (type === "assignment") {
                    setAssignments((prev) => prev.map((a) => a._id === id ? { ...a, downloadCount: (a.downloadCount || 0) + 1 } : a));
                } else {
                    setNotes((prev) => prev.map((n) => n._id === id ? { ...n, downloadCount: (n.downloadCount || 0) + 1 } : n));
                }

                const fileRes = await fetch(data.url);
                const blob = await fileRes.blob();
                const blobUrl = window.URL.createObjectURL(blob);

                const sanitizeName = (name) => name.replace(/[^a-zA-Z0-9-_\s]/g, '');
                const customFileName = `${sanitizeName(title)}.pdf`;

                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = customFileName;
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            }

        } catch (e) {
            console.error("Download failed", e);
        } finally {
            setDownloadingId(null);
        }
    };

    if (!subject) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
                <div className="text-center p-12 bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-xl">
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Subject or Course not found</h2>
                    <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    // Group Papers by Section for UI
    const papersBySection = PAPER_SECTIONS.reduce((acc, section) => {
        acc[section] = papers.filter(p => p.section === section);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-[#121212] dark:to-gray-900 p-8 sm:p-20">
            <main className="max-w-5xl mx-auto">
                <Link href={`/courses/${courseId}`} className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to {subject.courseId?.name || "Subjects"}
                </Link>

                <header className="mb-12 bg-white/60 dark:bg-[#1E1E1E]/60 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white/50 dark:border-gray-800">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{subject.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">{subject.courseId?.name}</p>

                    {/* Mobile Dropdown */}
                    <div className="md:hidden mt-8 relative">
                        <select
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            className="appearance-none w-full bg-white dark:bg-[#222222] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 block p-4 pr-10 shadow-sm transition-colors cursor-pointer"
                        >
                            <option value="papers">Previous Year Papers</option>
                            <option value="notes">Class Notes</option>
                            <option value="assignments">Assignments</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                            <ChevronDown className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Desktop TABS */}
                    <div className="hidden md:flex border-b border-gray-200 dark:border-gray-800 mt-8 overflow-x-auto">
                        <button
                            className={`px-6 py-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === "papers" ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                }`}
                            onClick={() => setActiveTab("papers")}
                        >
                            <Clock className="w-4 h-4" /> Previous Year Papers
                        </button>
                        <button
                            className={`px-6 py-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === "notes" ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                }`}
                            onClick={() => setActiveTab("notes")}
                        >
                            <BookOpen className="w-4 h-4" /> Class Notes
                        </button>
                        <button
                            className={`px-6 py-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === "assignments" ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                }`}
                            onClick={() => setActiveTab("assignments")}
                        >
                            <FileText className="w-4 h-4" /> Assignments
                        </button>
                    </div>
                </header>

                {activeTab === "notes" && (
                    <>
                        {notes.length === 0 ? (
                            <div className="text-center py-20 bg-white/50 dark:bg-[#1E1E1E]/50 backdrop-blur-sm rounded-3xl border border-white/40 dark:border-gray-800 shadow-xl">
                                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">No notes found</h3>
                                <p className="text-gray-400 dark:text-gray-500 mt-2">No notes have been uploaded for this subject yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {notes.map((note) => (
                                    <div key={note._id} className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col justify-between h-full group">
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">{note.title}</h3>
                                        </div>

                                        <button
                                            onClick={() => handleDownload(note._id, note.pdfUrl, note.title, "note")}
                                            disabled={downloadingId === note._id}
                                            className="w-full bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-400 hover:text-white border border-indigo-100 dark:border-indigo-800 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-md disabled:opacity-70"
                                        >
                                            {downloadingId === note._id ? (
                                                <><Loader2 className="w-5 h-5 animate-spin" /> Fetching...</>
                                            ) : (
                                                <><Download className="w-5 h-5" /> Download Note</>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === "papers" && (
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm p-8 border border-gray-100 dark:border-gray-800">
                        {years.length === 0 ? (
                            <div className="text-center py-12">
                                <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No previous papers available</h3>
                                <p className="text-gray-400 dark:text-gray-500 mt-1">Check back later for past exams and papers.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Sidebar: Years */}
                                <div className="md:w-64 flex-shrink-0">
                                    <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-2">Select Year</h3>
                                    
                                    {/* Mobile Dropdown for Years */}
                                    <div className="md:hidden relative mb-6">
                                        <select
                                            value={selectedYear || ""}
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            className="appearance-none w-full bg-white dark:bg-[#222222] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 block p-4 pr-10 shadow-sm transition-colors cursor-pointer"
                                        >
                                            {years.map((y) => (
                                                <option key={y} value={y}>
                                                    {y} Papers
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </div>

                                    {/* Desktop List for Years */}
                                    <div className="hidden md:block space-y-1">
                                        {years.map((y) => (
                                            <button
                                                key={y}
                                                onClick={() => setSelectedYear(y)}
                                                className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${selectedYear === y
                                                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A2A2A]"
                                                    }`}
                                            >
                                                {y} Papers
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Main Content: Sections & Papers */}
                                <div className="flex-1">
                                    {loadingPapers ? (
                                        <div className="h-64 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="space-y-10">
                                            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                                                <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg"><Clock className="w-5 h-5" /></div>
                                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Showing {selectedYear} Archive</h2>
                                            </div>

                                            {papers.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {papers.map((paper) => (
                                                        <div key={paper._id} className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col justify-between h-full group">
                                                            <div>
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                                                        <FileText className="w-6 h-6" />
                                                                    </div>
                                                                </div>
                                                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">{paper.title}</h3>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDownload(paper._id, paper.pdfUrl, paper.title, "paper")}
                                                                disabled={downloadingId === paper._id}
                                                                className="w-full bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-400 hover:text-white border border-indigo-100 dark:border-indigo-800 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-md disabled:opacity-70"
                                                            >
                                                                {downloadingId === paper._id ? (
                                                                    <><Loader2 className="w-5 h-5 animate-spin" /> Fetching...</>
                                                                ) : (
                                                                    <><Download className="w-5 h-5" /> Download</>
                                                                )}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {papers.length === 0 && (
                                                <p className="text-gray-500 text-center py-8">No papers found for {selectedYear}.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "assignments" && (
                    <div className="mt-8">
                        {loadingAssignments ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                            </div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center py-20 bg-white/50 dark:bg-[#1E1E1E]/50 backdrop-blur-sm rounded-3xl border border-white/40 dark:border-gray-800 shadow-xl">
                                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">No assignments found</h3>
                                <p className="text-gray-400 dark:text-gray-500 mt-2">No assignments have been uploaded for this subject yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {assignments.map((assignment) => (
                                    <div key={assignment._id} className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col justify-between h-full group">
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">{assignment.title}</h3>
                                        </div>

                                        <button
                                            onClick={() => handleDownload(assignment._id, assignment.pdfUrl, assignment.title, "assignment")}
                                            disabled={downloadingId === assignment._id}
                                            className="w-full bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-400 hover:text-white border border-indigo-100 dark:border-indigo-800 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-md disabled:opacity-70"
                                        >
                                            {downloadingId === assignment._id ? (
                                                <><Loader2 className="w-5 h-5 animate-spin" /> Fetching...</>
                                            ) : (
                                                <><Download className="w-5 h-5" /> Download</>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                <div className="mt-16">
                    <ShareResources />
                </div>
            </main>
        </div>
    );
}
