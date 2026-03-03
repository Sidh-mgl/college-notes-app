"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Download, Loader2, BookOpen, Clock } from "lucide-react";

export default function SubjectView({ courseId, subjectId, subject, initialNotes }) {
    const [notes, setNotes] = useState(initialNotes || []);
    const [downloadingId, setDownloadingId] = useState(null);

    // Papers State
    const [activeTab, setActiveTab] = useState("notes"); // 'notes' or 'papers'
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [papers, setPapers] = useState([]);
    const [loadingPapers, setLoadingPapers] = useState(false);

    const PAPER_SECTIONS = ["Sem 1", "Sem 2", "Sem 3", "Back Paper", "End Sem Paper"];

    useEffect(() => {
        if (activeTab === "papers" && years.length === 0) {
            fetchYears();
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedYear) {
            fetchPapers(selectedYear);
        }
    }, [selectedYear]);

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

    const handleDownload = async (id, pdfUrl, title, isPaper = false) => {
        try {
            setDownloadingId(id);

            const endpoint = isPaper ? `/api/download-paper/${id}` : `/api/download/${id}`;
            const res = await fetch(endpoint, { method: "POST" });
            const data = await res.json();

            if (res.ok) {
                if (isPaper) {
                    setPapers((prev) => prev.map((p) => p._id === id ? { ...p, downloadCount: (p.downloadCount || 0) + 1 } : p));
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-12 bg-white rounded-3xl shadow-xl">
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Subject or Course not found</h2>
                    <Link href="/" className="text-indigo-600 hover:underline">Return Home</Link>
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 sm:p-20 font-sans">
            <main className="max-w-5xl mx-auto">
                <Link href={`/courses/${courseId}`} className="inline-flex items-center text-gray-500 hover:text-indigo-600 font-medium mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to {subject.courseId?.name || "Subjects"}
                </Link>

                <header className="mb-12 bg-white/60 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white/50">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{subject.name}</h1>
                    <p className="text-gray-500 font-medium text-lg">{subject.courseId?.name}</p>

                    {/* TABS */}
                    <div className="flex border-b border-gray-200 mt-8">
                        <button
                            className={`px-6 py-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${activeTab === "notes" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            onClick={() => setActiveTab("notes")}
                        >
                            <BookOpen className="w-4 h-4" /> Class Notes
                        </button>
                        <button
                            className={`px-6 py-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${activeTab === "papers" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            onClick={() => setActiveTab("papers")}
                        >
                            <Clock className="w-4 h-4" /> Previous Year Papers
                        </button>
                    </div>
                </header>

                {activeTab === "notes" && (
                    <>
                        {notes.length === 0 ? (
                            <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/40 shadow-xl">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-600">No notes found</h3>
                                <p className="text-gray-400 mt-2">No notes have been uploaded for this subject yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {notes.map((note) => (
                                    <div key={note._id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 flex flex-col justify-between h-full group">
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="bg-orange-100 text-orange-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-6">{note.title}</h3>
                                        </div>

                                        <button
                                            onClick={() => handleDownload(note._id, note.pdfUrl, note.title, false)}
                                            disabled={downloadingId === note._id}
                                            className="w-full bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-md disabled:opacity-70"
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
                    <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                        {years.length === 0 ? (
                            <div className="text-center py-12">
                                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600">No previous papers available</h3>
                                <p className="text-gray-400 mt-1">Check back later for past exams and papers.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Sidebar: Years */}
                                <div className="md:w-64 flex-shrink-0">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Select Year</h3>
                                    <div className="space-y-1">
                                        {years.map((y) => (
                                            <button
                                                key={y}
                                                onClick={() => setSelectedYear(y)}
                                                className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${selectedYear === y
                                                    ? "bg-indigo-50 text-indigo-600"
                                                    : "text-gray-600 hover:bg-gray-50"
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
                                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><Clock className="w-5 h-5" /></div>
                                                <h2 className="text-2xl font-bold text-gray-800">Showing {selectedYear} Archive</h2>
                                            </div>

                                            {PAPER_SECTIONS.map((section) => {
                                                const sectionPapers = papersBySection[section] || [];
                                                if (sectionPapers.length === 0) return null;

                                                return (
                                                    <div key={section} className="bg-gray-50 rounded-2xl p-6">
                                                        <h3 className="text-lg font-bold text-gray-800 mb-4">{section}</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {sectionPapers.map((paper) => (
                                                                <div key={paper._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                                                                    <div className="mb-4">
                                                                        <h4 className="font-semibold text-gray-900">{paper.title}</h4>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleDownload(paper._id, paper.pdfUrl, paper.title, true)}
                                                                        disabled={downloadingId === paper._id}
                                                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                                                                    >
                                                                        {downloadingId === paper._id ? (
                                                                            <><Loader2 className="w-4 h-4 animate-spin" /> Fetching...</>
                                                                        ) : (
                                                                            <><Download className="w-4 h-4" /> Download</>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
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
            </main>
        </div>
    );
}
