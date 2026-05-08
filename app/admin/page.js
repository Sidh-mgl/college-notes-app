"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Upload, CheckCircle, AlertCircle, FileText, Trash2, FolderOpen, BookOpen, AlertTriangle, Clock, Users, UserCheck, UserMinus, Shield, Filter, Loader2, BarChart3 } from "lucide-react";
import SearchableDropdown from "@/components/SearchableDropdown";

export default function AdminDashboard() {
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]); // to render all subjects in the list
    const [notes, setNotes] = useState([]);
    const [papers, setPapers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [activeUploadTab, setActiveUploadTab] = useState("paper"); // "paper", "note", "assignment"
    const [activeListTab, setActiveListTab] = useState("paper"); // Default to paper

    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [analyticsData, setAnalyticsData] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [subjectFilterCourseId, setSubjectFilterCourseId] = useState("");
    const [docFilterCourseId, setDocFilterCourseId] = useState("");
    const [docFilterSubjectId, setDocFilterSubjectId] = useState("");
    const [userSearchQuery, setUserSearchQuery] = useState("");

    const dropdownClasses = "w-full bg-white dark:bg-[#121212] text-black dark:text-white border border-gray-300 dark:border-gray-700 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1E1E1E] focus:ring-2 focus:ring-indigo-500 transition-colors outline-none cursor-pointer";


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
        section: "In-Sem 1",
        file: null,
    });

    const [assignmentForm, setAssignmentForm] = useState({
        title: "",
        courseId: "",
        subjectId: "",
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

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        await fetchUserRole();
        await fetchCourses();
        await fetchAllSubjects();
        await fetchAllNotes();
        await fetchAllPapers();
        await fetchAllAssignments();
        setIsLoading(false);
    };

    const fetchUserRole = async () => {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            if (data.authenticated) {
                setCurrentUserRole(data.user.role);
                if (data.user.role === "superadmin") {
                    await fetchUsers();
                    await fetchAnalytics();
                }
            }
        } catch (e) {
            console.error("Failed to fetch user role", e);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (res.ok) {
                setUsersList(data.users || []);
            }
        } catch (e) {
            console.error("Failed to fetch users", e);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await fetch("/api/supadmin/analytics");
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setAnalyticsData(data.data);
                }
            }
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
        }
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

    const fetchAllAssignments = async () => {
        try {
            const res = await fetch("/api/assignments");
            const data = await res.json();
            setAssignments(data.assignments?.sort((a, b) => b.downloadCount - a.downloadCount) || []);
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
                setStatus({ type: "success", message: "Note uploaded successfully! Refreshing..." });
                setNoteForm({ ...noteForm, title: "", file: null });
                setTimeout(() => window.location.reload(), 1000);
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
                setStatus({ type: "success", message: "Paper uploaded successfully! Refreshing..." });
                setPaperForm({ ...paperForm, title: "", file: null });
                setTimeout(() => window.location.reload(), 1000);
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

    const handleAssignmentSubmit = async (e) => {
        e.preventDefault();
        if (!assignmentForm.file) {
            setStatus({ type: "error", message: "Please select a file." });
            return;
        }
        setIsUploading(true);
        setStatus({ type: "", message: "" });

        try {
            const formData = new FormData();
            formData.append("title", assignmentForm.title);
            formData.append("courseId", assignmentForm.courseId);
            formData.append("subjectId", assignmentForm.subjectId);
            formData.append("file", assignmentForm.file);

            const courseName = courses.find((c) => c._id === assignmentForm.courseId)?.name || "course";
            const subjectName = subjects.find((s) => s._id === assignmentForm.subjectId)?.name || "subject";

            formData.append("courseName", courseName);
            formData.append("subjectName", subjectName);

            const res = await fetch("/api/admin/upload-assignment", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setStatus({ type: "success", message: "Assignment uploaded successfully! Refreshing..." });
                setAssignmentForm({ ...assignmentForm, title: "", file: null });
                setTimeout(() => window.location.reload(), 1000);
            } else {
                const err = await res.json();
                setStatus({ type: "error", message: err.error });
            }
        } catch (e) {
            setStatus({ type: "error", message: "Failed to upload assignment." });
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

    const handleMakeAdmin = async (userId) => {
        setStatus({ type: "", message: "" });
        try {
            const res = await fetch(`/api/admin/make-admin/${userId}`, { method: "POST" });
            if (res.ok) {
                setStatus({ type: "success", message: "User promoted to admin successfully." });
                fetchUsers();
            } else {
                const err = await res.json();
                setStatus({ type: "error", message: err.error });
            }
        } catch (error) {
            setStatus({ type: "error", message: "Failed to promote user." });
        }
    };

    const handleRemoveAdmin = async (userId) => {
        setStatus({ type: "", message: "" });
        try {
            const res = await fetch(`/api/admin/remove-admin/${userId}`, { method: "POST" });
            if (res.ok) {
                setStatus({ type: "success", message: "Admin role removed successfully." });
                fetchUsers();
            } else {
                const err = await res.json();
                setStatus({ type: "error", message: err.error });
            }
        } catch (error) {
            setStatus({ type: "error", message: "Failed to remove admin role." });
        }
    };

    return (
        <div className="admin-view min-h-screen bg-gray-50 dark:bg-[#121212] p-8 sm:p-12 font-sans relative text-gray-900 dark:text-gray-100">
            {/* Modals */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-full">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Deletion</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
                            Are you sure you want to delete the {deleteModal.itemType === "users" ? "user" : deleteModal.itemType} <span className="font-bold">&quot;{deleteModal.itemName}&quot;</span>?
                            {deleteModal.itemType === "course" && " This will also delete all subjects and notes under this course."}
                            {deleteModal.itemType === "subject" && " This will also delete all notes under this subject."}
                            {deleteModal.itemType === "users" && " This will permanently remove their account and access from the system."}
                            <br /><br />
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3 flex-wrap">
                            <button
                                disabled={isDeleting}
                                onClick={() => setDeleteModal({ isOpen: false, itemType: "", itemId: null, itemName: "" })}
                                className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                <header className="mb-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Manage courses, subjects, and upload PDF notes.</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-100 dark:border-red-900/50"
                    >
                        Logout
                    </button>
                </header>

                {status.message && (
                    <div className={`p-4 mb-8 rounded-xl flex items-center gap-3 ${status.type === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800" : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"}`}>
                        {status.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="font-medium">{status.message}</span>
                    </div>
                )}

                {/* Forms Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {/* Create Course */}
                    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative">
                        {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>}
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-800 dark:text-gray-100">
                            <PlusCircle className="w-5 h-5 text-indigo-500" /> Add Course
                        </h2>
                        <form onSubmit={handleCourseSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Course Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. B.Tech Computer Science"
                                    className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-black dark:text-white bg-transparent dark:bg-[#121212]"
                                    value={courseForm.name}
                                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                                Create Course
                            </button>
                        </form>
                    </div>

                    {/* Create Subject */}
                    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative">
                        {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>}
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-800 dark:text-gray-100">
                            <PlusCircle className="w-5 h-5 text-purple-500" /> Add Subject
                        </h2>
                        <form onSubmit={handleSubjectSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
                                <SearchableDropdown
                                    options={courses}
                                    value={subjectForm.courseId}
                                    onChange={(val) => setSubjectForm({ ...subjectForm, courseId: val })}
                                    placeholder="Select Course"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Subject Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Data Structures"
                                    className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-black dark:text-white bg-transparent dark:bg-[#121212]"
                                    value={subjectForm.name}
                                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                                Create Subject
                            </button>
                        </form>
                    </div>

                    {/* Upload Section */}
                    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative">
                        {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>}
                        <div className="flex border-b border-gray-100 dark:border-gray-800 mb-6">
                            <button
                                className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeUploadTab === "paper" ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                                onClick={() => setActiveUploadTab("paper")}
                            >
                                <span className="flex items-center justify-center gap-2"><Clock className="w-4 h-4" /> Paper</span>
                            </button>
                            <button
                                className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeUploadTab === "note" ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                                onClick={() => setActiveUploadTab("note")}
                            >
                                <span className="flex items-center justify-center gap-2"><Upload className="w-4 h-4" /> Note</span>
                            </button>
                            <button
                                className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeUploadTab === "assignment" ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                                onClick={() => setActiveUploadTab("assignment")}
                            >
                                <span className="flex items-center justify-center gap-2"><FileText className="w-4 h-4" /> Assignment</span>
                            </button>
                        </div>

                        {activeUploadTab === "paper" && (
                            <form onSubmit={handlePaperSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Course</label>
                                    <SearchableDropdown
                                        options={courses}
                                        value={paperForm.courseId}
                                        onChange={(val) => {
                                            setPaperForm({ ...paperForm, courseId: val, subjectId: "" });
                                            fetchSubjectsForForm(val);
                                        }}
                                        placeholder="Select Course"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                                    <SearchableDropdown
                                        options={subjects}
                                        value={paperForm.subjectId}
                                        onChange={(val) => setPaperForm({ ...paperForm, subjectId: val })}
                                        disabled={!paperForm.courseId}
                                        placeholder="Select Subject"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Year</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-black dark:text-white bg-transparent dark:bg-[#121212]"
                                            value={paperForm.year}
                                            onChange={(e) => setPaperForm({ ...paperForm, year: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Section</label>
                                        <select
                                            required
                                            className={dropdownClasses}
                                            value={paperForm.section}
                                            onChange={(e) => setPaperForm({ ...paperForm, section: e.target.value })}
                                        >
                                            <option value="In-Sem 1">In-Sem 1</option>
                                            <option value="In-Sem 2">In-Sem 2</option>
                                            <option value="In-Sem 3">In-Sem 3</option>
                                            <option value="Back Paper">Back Paper</option>
                                            <option value="End Sem Paper">End Sem Paper</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Paper Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 2023 Finals"
                                        className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-black dark:text-white bg-transparent dark:bg-[#121212]"
                                        value={paperForm.title}
                                        onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">PDF File</label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        required
                                        className="w-full border border-gray-200 dark:border-gray-700 p-2 rounded-xl outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/40 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/60 text-black dark:text-white bg-transparent dark:bg-[#121212]"
                                        onChange={(e) => setPaperForm({ ...paperForm, file: e.target.files[0] })}
                                    />
                                </div>
                                <button disabled={isUploading} type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2">
                                    {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : "Upload Paper"}
                                </button>
                            </form>
                        )}
                        {activeUploadTab === "note" && (
                            <form onSubmit={handleNoteSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
                                    <SearchableDropdown
                                        options={courses}
                                        value={noteForm.courseId}
                                        onChange={(val) => {
                                            setNoteForm({ ...noteForm, courseId: val, subjectId: "" });
                                            fetchSubjectsForForm(val);
                                        }}
                                        placeholder="Select Course"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                                    <SearchableDropdown
                                        options={subjects}
                                        value={noteForm.subjectId}
                                        onChange={(val) => setNoteForm({ ...noteForm, subjectId: val })}
                                        disabled={!noteForm.courseId}
                                        placeholder="Select Subject"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Note Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Unit 1 Reference"
                                        className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black dark:text-white bg-transparent dark:bg-[#121212]"
                                        value={noteForm.title}
                                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">PDF File</label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        required
                                        className="w-full border border-gray-200 dark:border-gray-700 p-2 rounded-xl outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/40 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/60 text-black dark:text-white bg-transparent dark:bg-[#121212]"
                                        onChange={(e) => setNoteForm({ ...noteForm, file: e.target.files[0] })}
                                    />
                                </div>
                                <button disabled={isUploading} type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2">
                                    {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : "Upload Note"}
                                </button>
                            </form>
                        )}
                        {activeUploadTab === "assignment" && (
                            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
                                    <SearchableDropdown
                                        options={courses}
                                        value={assignmentForm.courseId}
                                        onChange={(val) => {
                                            setAssignmentForm({ ...assignmentForm, courseId: val, subjectId: "" });
                                            fetchSubjectsForForm(val);
                                        }}
                                        placeholder="Select Course"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                                    <SearchableDropdown
                                        options={subjects}
                                        value={assignmentForm.subjectId}
                                        onChange={(val) => setAssignmentForm({ ...assignmentForm, subjectId: val })}
                                        disabled={!assignmentForm.courseId}
                                        placeholder="Select Subject"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Assignment Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Assignment 1"
                                        className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-black dark:text-white bg-transparent dark:bg-[#121212]"
                                        value={assignmentForm.title}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">PDF File</label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        required
                                        className="w-full border border-gray-200 dark:border-gray-700 p-2 rounded-xl outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-green-900/40 file:text-green-700 dark:file:text-green-400 hover:file:bg-green-100 dark:hover:file:bg-green-900/60 text-black dark:text-white bg-transparent dark:bg-[#121212]"
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, file: e.target.files[0] })}
                                    />
                                </div>
                                <button disabled={isUploading} type="submit" className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2">
                                    {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : "Upload Assignment"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Data Lists Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {/* Courses List */}
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[400px]">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#2A2A2A] flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-indigo-500" /> Managed Courses
                                </h2>
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 py-1 px-3 rounded-full font-bold">{courses.length}</span>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2">
                                <table className="w-full text-left border-collapse">
                                    <tbody className="text-sm">
                                        {courses.map((course) => (
                                            <tr key={course._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors even:bg-gray-50/50 dark:even:bg-[#121212]/50 rounded-lg group">
                                                <td className="p-4 font-semibold text-gray-900 dark:text-gray-200 flex-1">{course.name}</td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => confirmDelete("course", course._id, course.name)} className="text-gray-400 dark:text-gray-500 group-hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {courses.length === 0 && <tr><td colSpan="2" className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium">No courses setup.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Subjects List */}
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[400px]">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#2A2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <FolderOpen className="w-5 h-5 text-purple-500" /> Managed Subjects
                                </h2>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <select
                                        className="bg-white dark:bg-[#1E1E1E] text-black dark:text-white border border-gray-300 dark:border-gray-700 p-2 rounded-lg text-sm flex-1 sm:w-48 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                        value={subjectFilterCourseId}
                                        onChange={(e) => setSubjectFilterCourseId(e.target.value)}
                                    >
                                        <option value="">All Courses</option>
                                        {courses.map((c) => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <span className="text-xs text-gray-500 bg-gray-200 py-1.5 px-3 rounded-full font-bold flex-shrink-0">
                                        {allSubjects.filter(sub => !subjectFilterCourseId || sub.courseId === subjectFilterCourseId).length}
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2">
                                <table className="w-full text-left border-collapse">
                                    <tbody className="text-sm">
                                        {allSubjects
                                            .filter(sub => !subjectFilterCourseId || sub.courseId === subjectFilterCourseId)
                                            .map((subject) => (
                                            <tr key={subject._id} className="border-b border-gray-50 hover:bg-purple-50/50 transition-colors even:bg-gray-50/50 rounded-lg group">
                                                <td className="p-4">
                                                    <div className="font-semibold text-gray-900">{subject.name}</div>
                                                    <div className="text-xs text-purple-600 mt-1 font-medium">{subject.courseName}</div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => confirmDelete("subject", subject._id, subject.name)} className="text-gray-400 group-hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {allSubjects.filter(sub => !subjectFilterCourseId || sub.courseId === subjectFilterCourseId).length === 0 && <tr><td colSpan="2" className="p-8 text-center text-gray-500 font-medium">No subjects setup for this filter.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Documents Filters */}
                    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <Filter className="w-5 h-5 text-blue-500" /> Filter Documents
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <select
                                    className={dropdownClasses}
                                    value={docFilterCourseId}
                                    onChange={(e) => {
                                        setDocFilterCourseId(e.target.value);
                                        setDocFilterSubjectId("");
                                    }}
                                >
                                    <option value="" className="text-gray-400 dark:text-gray-500">All Courses</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                                <select
                                    className={dropdownClasses}
                                    value={docFilterSubjectId}
                                    onChange={(e) => setDocFilterSubjectId(e.target.value)}
                                    disabled={!docFilterCourseId}
                                >
                                    <option value="" className="text-gray-400 dark:text-gray-500">All Subjects</option>
                                    {subjects
                                        .map(s => <option key={s._id} value={s._id}>{s.name}</option>)
                                    }
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Documents Data List: Side by Side */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                        {/* Notes Table */}
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[500px]">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#2A2A2A] flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-blue-500" /> Notes
                                </h2>
                                <span className="text-xs text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 py-1.5 px-3 rounded-full font-bold">
                                    {notes.filter(n => (!docFilterCourseId || (n.courseId?._id || n.courseId) === docFilterCourseId) && (!docFilterSubjectId || (n.subjectId?._id || n.subjectId) === docFilterSubjectId)).length}
                                </span>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white dark:bg-[#1E1E1E] border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm sticky top-0 z-10 shadow-sm">
                                            <th className="p-4 rounded-tl-xl font-semibold">Title</th>
                                            <th className="p-4 font-semibold">Course & Subject</th>
                                            <th className="p-4 font-semibold text-center">Stats</th>
                                            <th className="p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {notes.filter(n => (!docFilterCourseId || (n.courseId?._id || n.courseId) === docFilterCourseId) && (!docFilterSubjectId || (n.subjectId?._id || n.subjectId) === docFilterSubjectId)).map((doc) => (
                                            <tr key={doc._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors even:bg-gray-50/50 dark:even:bg-[#121212]/50 rounded-lg group">
                                                <td className="p-4 font-semibold text-gray-900 dark:text-gray-100">{doc.title}</td>
                                                <td className="p-4">
                                                    <div className="text-gray-700 dark:text-gray-300 font-medium">{doc.subjectName || doc.subjectId?.name || "N/A"}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{doc.courseName || doc.courseId?.name || "N/A"}</div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center justify-center text-xs font-bold px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                        {doc.downloadCount} ↓
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => confirmDelete("note", doc._id, doc.title)} className="text-gray-400 dark:text-gray-500 group-hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {notes.filter(n => (!docFilterCourseId || (n.courseId?._id || n.courseId) === docFilterCourseId) && (!docFilterSubjectId || (n.subjectId?._id || n.subjectId) === docFilterSubjectId)).length === 0 && (
                                            <tr><td colSpan="4" className="p-10 text-center text-gray-500 dark:text-gray-400 font-medium">No notes found matching filters.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Papers Table */}
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[500px]">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#2A2A2A] flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-indigo-500" /> Papers
                                </h2>
                                <span className="text-xs text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 py-1.5 px-3 rounded-full font-bold">
                                    {papers.filter(p => (!docFilterCourseId || (p.courseId?._id || p.courseId) === docFilterCourseId) && (!docFilterSubjectId || (p.subjectId?._id || p.subjectId) === docFilterSubjectId)).length}
                                </span>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white dark:bg-[#1E1E1E] border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm sticky top-0 z-10 shadow-sm">
                                            <th className="p-4 rounded-tl-xl font-semibold">Title/Meta</th>
                                            <th className="p-4 font-semibold">Course & Subject</th>
                                            <th className="p-4 font-semibold text-center">Stats</th>
                                            <th className="p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {papers.filter(p => (!docFilterCourseId || (p.courseId?._id || p.courseId) === docFilterCourseId) && (!docFilterSubjectId || (p.subjectId?._id || p.subjectId) === docFilterSubjectId)).map((doc) => (
                                            <tr key={doc._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors even:bg-gray-50/50 dark:even:bg-[#121212]/50 rounded-lg group">
                                                <td className="p-4">
                                                    <div className="font-semibold text-gray-900 dark:text-gray-100">{doc.title}</div>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-md">{doc.year}</span>
                                                        <span className="text-gray-500 dark:text-gray-500 text-xs font-medium">{doc.section}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-gray-700 dark:text-gray-300 font-medium">{doc.subjectName || doc.subjectId?.name || "N/A"}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{doc.courseName || doc.courseId?.name || "N/A"}</div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center justify-center text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                                                        {doc.downloadCount} ↓
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => confirmDelete("paper", doc._id, doc.title)} className="text-gray-400 dark:text-gray-500 group-hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {papers.filter(p => (!docFilterCourseId || (p.courseId?._id || p.courseId) === docFilterCourseId) && (!docFilterSubjectId || (p.subjectId?._id || p.subjectId) === docFilterSubjectId)).length === 0 && (
                                            <tr><td colSpan="4" className="p-10 text-center text-gray-500 dark:text-gray-400 font-medium">No papers found matching filters.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Assignments Table */}
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[500px]">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#2A2A2A] flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-green-500" /> Assignments
                                </h2>
                                <span className="text-xs text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/30 py-1.5 px-3 rounded-full font-bold">
                                    {assignments.filter(a => (!docFilterCourseId || (a.courseId?._id || a.courseId) === docFilterCourseId) && (!docFilterSubjectId || (a.subjectId?._id || a.subjectId) === docFilterSubjectId)).length}
                                </span>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white dark:bg-[#1E1E1E] border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm sticky top-0 z-10 shadow-sm">
                                            <th className="p-4 rounded-tl-xl font-semibold">Title</th>
                                            <th className="p-4 font-semibold">Course & Subject</th>
                                            <th className="p-4 font-semibold text-center">Stats</th>
                                            <th className="p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {assignments.filter(a => (!docFilterCourseId || (a.courseId?._id || a.courseId) === docFilterCourseId) && (!docFilterSubjectId || (a.subjectId?._id || a.subjectId) === docFilterSubjectId)).map((doc) => (
                                            <tr key={doc._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-colors even:bg-gray-50/50 dark:even:bg-[#121212]/50 rounded-lg group">
                                                <td className="p-4 font-semibold text-gray-900 dark:text-gray-100">{doc.title}</td>
                                                <td className="p-4">
                                                    <div className="text-gray-700 dark:text-gray-300 font-medium">{doc.subjectName || doc.subjectId?.name || "N/A"}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{doc.courseName || doc.courseId?.name || "N/A"}</div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center justify-center text-xs font-bold px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                                        {doc.downloadCount} ↓
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => confirmDelete("assignment", doc._id, doc.title)} className="text-gray-400 dark:text-gray-500 group-hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {assignments.filter(a => (!docFilterCourseId || (a.courseId?._id || a.courseId) === docFilterCourseId) && (!docFilterSubjectId || (a.subjectId?._id || a.subjectId) === docFilterSubjectId)).length === 0 && (
                                            <tr><td colSpan="4" className="p-10 text-center text-gray-500 dark:text-gray-400 font-medium">No assignments found matching filters.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* User Management Data List (Superadmin Only) */}
                    {currentUserRole === "superadmin" && (
                        <>
                        {/* Course Analytics Data List (Superadmin Only) */}
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mt-12 mb-8">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#2A2A2A] flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <BarChart3 className="w-6 h-6 text-emerald-600" /> Admin Course Analytics
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white dark:bg-[#1E1E1E] border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                                            <th className="p-4 rounded-tl-xl font-semibold">Admin Name</th>
                                            <th className="p-4 font-semibold">Course</th>
                                            <th className="p-4 font-semibold text-center">Notes</th>
                                            <th className="p-4 font-semibold text-center">Papers</th>
                                            <th className="p-4 font-semibold text-center">Assigns</th>
                                            <th className="p-4 font-semibold text-center text-indigo-600 dark:text-indigo-400">Total Uploads</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {analyticsData.map((row, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">{row.admin?.name || "Unknown"}</div>
                                                    <div className="text-xs text-gray-500">{row.admin?.email || "-"}</div>
                                                </td>
                                                <td className="p-4 text-gray-700 dark:text-gray-300 font-medium">{row.course?.name || "Unknown"}</td>
                                                <td className="p-4 text-center text-gray-600 dark:text-gray-400">{row.notesCount}</td>
                                                <td className="p-4 text-center text-gray-600 dark:text-gray-400">{row.papersCount}</td>
                                                <td className="p-4 text-center text-gray-600 dark:text-gray-400">{row.assignmentsCount}</td>
                                                <td className="p-4 text-center font-bold text-indigo-600 dark:text-indigo-400">{row.totalUploads}</td>
                                            </tr>
                                        ))}
                                        {analyticsData.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="p-8 text-center text-gray-400 dark:text-gray-500">
                                                    No upload data found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mt-12 mb-12">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#2A2A2A] flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <Shield className="w-6 h-6 text-indigo-600" /> User Management
                                </h2>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Search by name or email..." 
                                        className="border-gray-300 dark:border-gray-700 bg-transparent border px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:text-white outline-none"
                                        value={userSearchQuery}
                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                    />
                                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 py-1.5 px-4 rounded-full font-bold">{usersList.filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase())).length} Users</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white dark:bg-[#1E1E1E] border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                                            <th className="p-4 rounded-tl-xl font-semibold">Name</th>
                                            <th className="p-4 font-semibold">Email</th>
                                            <th className="p-4 font-semibold text-center">Role</th>
                                            <th className="p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {usersList.filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase())).map((user) => (
                                            <tr key={user._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
                                                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{user.name}</td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400">{user.email}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex items-center justify-center text-xs font-bold px-3 py-1.5 rounded-full ${user.role === "superadmin" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300" : user.role === "admin" ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {user.role === "user" && (
                                                            <button onClick={() => handleMakeAdmin(user._id)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors inline-flex items-center gap-2 text-sm border border-transparent">
                                                                <UserCheck className="w-4 h-4" /> Make Admin
                                                            </button>
                                                        )}
                                                        {user.role === "admin" && (
                                                            <button onClick={() => handleRemoveAdmin(user._id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors inline-flex items-center gap-2 text-sm border border-transparent">
                                                                <UserMinus className="w-4 h-4" /> Remove Admin
                                                            </button>
                                                        )}
                                                        {user.role !== "superadmin" && (
                                                            <button onClick={() => confirmDelete("users", user._id, user.name)} className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Delete User">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {usersList.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="p-8 text-center text-gray-400 dark:text-gray-500">
                                                    No users found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        </>
                    )}
            </div>
        </div>
    );
}
