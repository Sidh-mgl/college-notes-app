"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Download, Loader2 } from "lucide-react";

export default function NoteList({ courseId, subjectId, subject, initialNotes }) {
    const [notes, setNotes] = useState(initialNotes || []);
    const [downloadingId, setDownloadingId] = useState(null);

    const handleDownload = async (noteId, pdfUrl, noteTitle) => {
        try {
            setDownloadingId(noteId);

            const res = await fetch(`/api/download/${noteId}`, { method: "POST" });
            const data = await res.json();

            if (res.ok) {
                setNotes((prevNotes) =>
                    prevNotes.map((note) =>
                        note._id === noteId ? { ...note, downloadCount: (note.downloadCount || 0) + 1 } : note
                    )
                );

                // Fetch the file as a Blob to explicitly set the filename
                const fileRes = await fetch(data.url);
                const blob = await fileRes.blob();
                const blobUrl = window.URL.createObjectURL(blob);

                const sanitizeName = (name) => name.replace(/[^a-zA-Z0-9-_\s]/g, '');
                const customFileName = `${sanitizeName(noteTitle)}.pdf`;

                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = customFileName;
                document.body.appendChild(link);
                link.click();

                // Cleanup
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            }

        } catch (e) {
            console.error("Download tracking failed", e);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 sm:p-20">
            <main className="max-w-5xl mx-auto">
                <Link href={`/courses/${courseId}`} className="inline-flex items-center text-gray-500 hover:text-indigo-600 font-medium mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to {subject.courseId?.name || "Subjects"}
                </Link>

                <header className="mb-12 bg-white/60 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white/50">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        Notes for {subject.name}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {subject.courseId?.name}
                    </p>
                </header>

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
                                    onClick={() => handleDownload(note._id, note.pdfUrl, note.title)}
                                    disabled={downloadingId === note._id}
                                    className="w-full bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-md disabled:opacity-70"
                                >
                                    {downloadingId === note._id ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" /> Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5" /> Download Note
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
