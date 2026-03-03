"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Upload, CheckCircle, AlertCircle, FileText, Trash2, FolderOpen, BookOpen, AlertTriangle, Clock } from "lucide-react";

export default function AdminDashboard() {
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]); // to render all subjects in the list
    const [notes, setNotes] = useState([]);
    const [papers, setPapers] = useState([]);
    const [activeUploadTab, setActiveUploadTab] = useState("note"); // "note" or "paper"
    const [activeListTab, setActiveListTab] = useState("note"); // "note" or "paper"

    const [courseForm, setCourseForm] = useState({ name: "" });
    const [subjectForm, setSubjectForm] = useState({ name: "", courseId: "" });
    const [noteForm, setNoteForm] = useState({
        title: "",
        courseId: "",
        subjectId: "",
        file: null,
    });

    const [paperForm, setPaperForm] = useState({
        title: "",
        courseId: "",
        subjectId: "",
        year: new Date().getFullYear(),
        section: "Sem 1",
        file: null,
    });

    const [status, setStatus] = useState({ type: "", message: "" });
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        itemType: "", // "course", "subject", "note"
        itemId: null,
        itemName: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        await fetchCourses();
        await fetchAllSubjects();
        await fetchAllNotes();
        await fetchAllPapers();
    };

    const fetchCourses = async () => {
        try {
            const res = await fetch("/api/courses");
            const data = await res.json();
            setCourses(data.courses || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAllSubjects = async () => {
        // Basic trick to get all subjects for admin view (since we usually filter by courseId)
        // We will map over courses to fetch their subjects and combine them
        try {
            const res = await fetch("/api/courses");
            const courseData = await res.json();
            let allSubs = [];
            for (const c of courseData.courses || []) {
                const sRes = await fetch(`/api/subjects?courseId=${c._id}`);
                const sData = await sRes.json();
                allSubs = [...allSubs, ...(sData.subjects || []).map(s => ({ ...s, courseName: c.name }))];
            }
            setAllSubjects(allSubs);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchSubjectsForForm = async (courseId) => {
        try {
            const res = await fetch(`/api/subjects?courseId=${courseId}`);
            const data = await res.json();
            setSubjects(data.subjects || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAllNotes = async () => {
        try {
            const res = await fetch("/api/notes");
            const data = await res.json();
            setNotes(data.notes?.sort((a, b) => b.downloadCount - a.downloadCount) || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAllPapers = async () => {
        try {
            // Need to recursively fetch papers across all subjects for admin view since no broad generic endpoint
            const res = await fetch("/api/courses");
            const courseData = await res.json();

            let allPapersList = [];
            for (const c of courseData.courses || []) {
                const sRes = await fetch(`/api/subjects?courseId=${c._id}`);
                const sData = await sRes.json();

                for (const s of sData.subjects || []) {
                    const yRes = await fetch(`/api/paper-years?subjectId=${s._id}`);
                    const yData = await yRes.json();

                    for (const y of yData.years || []) {
                        const pRes = await fetch(`/api/papers?subjectId=${s._id}&year=${y}`);
                        const pData = await pRes.json();
                        allPapersList = [...allPapersList, ...(pData.papers || []).map(p => ({ ...p, courseName: c.name, subjectName: s.name }))];
                    }
                }
            }
            setPapers(allPapersList.sort((a, b) => b.downloadCount - a.downloadCount));
        } catch (e) {
            console.error(e);
        }
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/course", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(courseForm),
            });
            if (res.ok) {
                setStatus({ type: "success", message: "Course created successfully!" });
                setCourseForm({ name: "" });
                fetchData();
            } else {
                const err = await res.json();
                setStatus({ type: "error", message: err.error });
            }
        } catch (e) {
            setStatus({ type: "error", message: "Failed to create course." });
        }
    };

    const handleSubjectSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/subject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(subjectForm),
            });
            if (res.ok) {
                setStatus({ type: "success", message: "Subject created successfully!" });
                setSubjectForm({ name: "", courseId: subjectForm.courseId });
                fetchData();
            } else {
                const err = await res.json();
                setStatus({ type: "error", message: err.error });
            }
        } catch (e) {
            setStatus({ type: "error", message: "Failed to create subject." });
        }
    };

    const handleNoteSubmit = async (e) => {
        e.preventDefault();
        if (!noteForm.file) {
            setStatus({ type: "error", message: "Please select a file." });
            return;
        }
        setIsUploading(true);
        setStatus({ type: "", message: "" });

        try {
            const formData = new FormData();
            formData.append("title", noteForm.title);
            formData.append("courseId", noteForm.courseId);
            formData.append("subjectId", noteForm.subjectId);
            formData.append("file", noteForm.file);

            const courseName = courses.find((c) => c._id === noteForm.courseId)?.name || "course";
            const subjectName = subjects.find((s) => s._id === noteForm.subjectId)?.name || "subject";

            formData.append("courseName", courseName);
            formData.append("subjectName", subjectName);

            const res = await fetch("/api/admin/upload-note", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setStatus({ type: "success", message: "Note uploaded successfully!" });
                setNoteForm({ ...noteForm, title: "", file: null });
                fetchData();
            } else {
                const err = await res.json();
                setStatus({ type: "error", message: err.error });
            }
        } catch (e) {
            setStatus({ type: "error", message: "Failed to upload note." });
        } finally {
            setIsUploading(false);
        }
    };

    const handlePaperSubmit = async (e) => {
        e.preventDefault();
        if (!paperForm.file) {
            setStatus({ type: "error", message: "Please select a file." });
            return;
        }
        setIsUploading(true);
        setStatus({ type: "", message: "" });

        try {
            const formData = new FormData();
            formData.append("title", paperForm.title);
            formData.append("courseId", paperForm.courseId);
            formData.append("subjectId", paperForm.subjectId);
            formData.append("year", paperForm.year);
            formData.append("section", paperForm.section);
            formData.append("file", paperForm.file);

            const courseName = courses.find((c) => c._id === paperForm.courseId)?.name || "course";
            const subjectName = subjects.find((s) => s._id === paperForm.subjectId)?.name || "subject";

            formData.append("courseName", courseName);
            formData.append("subjectName", subjectName);

            const res = await fetch("/api/admin/upload-paper", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setStatus({ type: "success", message: "Paper uploaded successfully!" });
                setPaperForm({ ...paperForm, title: "", file: null });
                fetchData();
            } else {
                const err = await res.json();
                setStatus({ type: "error", message: err.error });
            }
        } catch (e) {
            setStatus({ type: "error", message: "Failed to upload paper." });
        } finally {
            setIsUploading(false);
        }
    };

    const confirmDelete = (type, id, name) => {
        setDeleteModal({ isOpen: true, itemType: type, itemId: id, itemName: name });
    };

    const executeDelete = async () => {
        const { itemType, itemId } = deleteModal;
        setIsDeleting(true);
        setStatus({ type: "", message: "" });
        try {
            const res = await fetch(`/api/admin/${itemType}/${itemId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setStatus({ type: "success", message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully.` });
                fetchData(); // Refresh all lists
            } else {
                const err = await res.json();
                setStatus({ type: "error", message: err.error });
            }
        } catch (error) {
            setStatus({ type: "error", message: `Failed to delete ${itemType}.` });
        } finally {
            setIsDeleting(false);
            setDeleteModal({ isOpen: false, itemType: "", itemId: null, itemName: "" });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 sm:p-12 font-sans relative">
            {/* Modals */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-red-100 text-red-600 p-3 rounded-full">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
                        </div>
                        <p className="text-gray-600 mb-6 font-medium">
                            Are you sure you want to delete the {deleteModal.itemType} <span className="font-bold">"{deleteModal.itemName}"</span>?
                            {deleteModal.itemType === "course" && " This will also delete all subjects and notes under this course."}
                            {deleteModal.itemType === "subject" && " This will also delete all notes under this subject."}
                            <br /><br />
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3 flex-wrap">
                            <button
                                disabled={isDeleting}
                                onClick={() => setDeleteModal({ isOpen: false, itemType: "", itemId: null, itemName: "" })}
                                className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isDeleting}
                                onClick={executeDelete}
                                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-2 text-lg">Manage courses, subjects, and upload PDF notes.</p>
                </header>

                {status.message && (
                    <div className={`p-4 mb-8 rounded-xl flex items-center gap-3 ${status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {status.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="font-medium">{status.message}</span>
                    </div>
                )}

                {/* Forms Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {/* Create Course */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-800">
                            <PlusCircle className="w-5 h-5 text-indigo-500" /> Add Course
                        </h2>
                        <form onSubmit={handleCourseSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Course Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. B.Tech Computer Science"
                                    className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    value={courseForm.name}
                                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
                                Create Course
                            </button>
                        </form>
                    </div>

                    {/* Create Subject */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-800">
                            <PlusCircle className="w-5 h-5 text-purple-500" /> Add Subject
                        </h2>
                        <form onSubmit={handleSubjectSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Course</label>
                                <select
                                    required
                                    className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={subjectForm.courseId}
                                    onChange={(e) => setSubjectForm({ ...subjectForm, courseId: e.target.value })}
                                >
                                    <option value="">Select a course</option>
                                    {courses.map((c) => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Data Structures"
                                    className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={subjectForm.name}
                                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
                                Create Subject
                            </button>
                        </form>
                    </div>

                    {/* Upload Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex border-b border-gray-100 mb-6">
                            <button
                                className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeUploadTab === "note" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
                                onClick={() => setActiveUploadTab("note")}
                            >
                                <span className="flex items-center justify-center gap-2"><Upload className="w-4 h-4" /> Note</span>
                            </button>
                            <button
                                className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeUploadTab === "paper" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
                                onClick={() => setActiveUploadTab("paper")}
                            >
                                <span className="flex items-center justify-center gap-2"><Clock className="w-4 h-4" /> Paper</span>
                            </button>
                        </div>

                        {activeUploadTab === "note" ? (
                            <form onSubmit={handleNoteSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
                                    <select
                                        required
                                        className="w-full border-gray-200 border p-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={noteForm.courseId}
                                        onChange={(e) => {
                                            setNoteForm({ ...noteForm, courseId: e.target.value, subjectId: "" });
                                            fetchSubjectsForForm(e.target.value);
                                        }}
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map((c) => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                                    <select
                                        required
                                        className="w-full border-gray-200 border p-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={noteForm.subjectId}
                                        onChange={(e) => setNoteForm({ ...noteForm, subjectId: e.target.value })}
                                        disabled={!noteForm.courseId}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map((s) => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Note Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Unit 1 Reference"
                                        className="w-full border-gray-200 border p-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={noteForm.title}
                                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">PDF File</label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        required
                                        className="w-full border-gray-200 border p-2 rounded-xl outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={(e) => setNoteForm({ ...noteForm, file: e.target.files[0] })}
                                    />
                                </div>
                                <button disabled={isUploading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isUploading ? "Uploading..." : "Upload Note"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handlePaperSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
                                    <select
                                        required
                                        className="w-full border-gray-200 border p-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={paperForm.courseId}
                                        onChange={(e) => {
                                            setPaperForm({ ...paperForm, courseId: e.target.value, subjectId: "" });
                                            fetchSubjectsForForm(e.target.value);
                                        }}
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map((c) => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                                    <select
                                        required
                                        className="w-full border-gray-200 border p-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={paperForm.subjectId}
                                        onChange={(e) => setPaperForm({ ...paperForm, subjectId: e.target.value })}
                                        disabled={!paperForm.courseId}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map((s) => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Year</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full border-gray-200 border p-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={paperForm.year}
                                            onChange={(e) => setPaperForm({ ...paperForm, year: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
                                        <select
                                            required
                                            className="w-full border-gray-200 border p-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={paperForm.section}
                                            onChange={(e) => setPaperForm({ ...paperForm, section: e.target.value })}
                                        >
                                            <option value="Sem 1">Sem 1</option>
                                            <option value="Sem 2">Sem 2</option>
                                            <option value="Sem 3">Sem 3</option>
                                            <option value="Back Paper">Back Paper</option>
                                            <option value="End Sem Paper">End Sem Paper</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Paper Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 2023 Finals"
                                        className="w-full border-gray-200 border p-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={paperForm.title}
                                        onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">PDF File</label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        required
                                        className="w-full border-gray-200 border p-2 rounded-xl outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        onChange={(e) => setPaperForm({ ...paperForm, file: e.target.files[0] })}
                                    />
                                </div>
                                <button disabled={isUploading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isUploading ? "Uploading..." : "Upload Paper"}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Data Lists Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Courses List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-gray-500" /> Managed Courses
                                </h2>
                                <span className="text-xs text-gray-500 bg-gray-200 py-1 px-3 rounded-full font-bold">{courses.length}</span>
                            </div>
                            <div className="overflow-y-auto max-h-[300px]">
                                <table className="w-full text-left border-collapse">
                                    <tbody className="text-sm">
                                        {courses.map((course) => (
                                            <tr key={course._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-medium text-gray-900">{course.name}</td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => confirmDelete("course", course._id, course.name)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {courses.length === 0 && <tr><td colSpan="2" className="p-6 text-center text-gray-400">No courses setup.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Subjects List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <FolderOpen className="w-5 h-5 text-gray-500" /> Managed Subjects
                                </h2>
                                <span className="text-xs text-gray-500 bg-gray-200 py-1 px-3 rounded-full font-bold">{allSubjects.length}</span>
                            </div>
                            <div className="overflow-y-auto max-h-[300px]">
                                <table className="w-full text-left border-collapse">
                                    <tbody className="text-sm">
                                        {allSubjects.map((subject) => (
                                            <tr key={subject._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-900">{subject.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">Course: {subject.courseName}</div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => confirmDelete("subject", subject._id, subject.name)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {allSubjects.length === 0 && <tr><td colSpan="2" className="p-6 text-center text-gray-400">No subjects setup.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Documents Data List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => setActiveListTab("note")}
                                    className={`px-4 py-2 text-sm font-bold transition-colors ${activeListTab === "note" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                    Notes ({notes.length})
                                </button>
                                <button
                                    onClick={() => setActiveListTab("paper")}
                                    className={`px-4 py-2 text-sm font-bold transition-colors border-l border-gray-200 ${activeListTab === "paper" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                    Papers ({papers.length})
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white border-b border-gray-100 text-gray-500 text-sm">
                                        <th className="p-4 rounded-tl-xl font-semibold">Title</th>
                                        {activeListTab === "paper" && <th className="p-4 font-semibold">Metadata</th>}
                                        <th className="p-4 font-semibold">Course</th>
                                        <th className="p-4 font-semibold">Subject</th>
                                        <th className="p-4 font-semibold text-center">Downloads</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {(activeListTab === "note" ? notes : papers).map((doc) => (
                                        <tr key={doc._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium text-gray-900">{doc.title}</td>
                                            {activeListTab === "paper" && (
                                                <td className="p-4">
                                                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">{doc.year}</span>
                                                    <span className="ml-2 text-gray-500">{doc.section}</span>
                                                </td>
                                            )}
                                            <td className="p-4 text-gray-500">{doc.courseName || doc.courseId?.name || "N/A"}</td>
                                            <td className="p-4 text-gray-500">{doc.subjectName || doc.subjectId?.name || "N/A"}</td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center justify-center text-xs font-bold px-2 py-1 rounded-full ${activeListTab === "note" ? "bg-blue-100 text-blue-800" : "bg-indigo-100 text-indigo-800"}`}>
                                                    {doc.downloadCount}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => confirmDelete(activeListTab, doc._id, doc.title)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(activeListTab === "note" ? notes : papers).length === 0 && (
                                        <tr>
                                            <td colSpan={activeListTab === "paper" ? "6" : "5"} className="p-8 text-center text-gray-400">
                                                No {activeListTab}s uploaded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
