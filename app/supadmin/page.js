"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ShieldAlert,
  Search,
  LogOut,
  Check,
  X,
  ShieldPlus,
  ShieldMinus,
  AlertTriangle,
  BarChart3,
  ShieldCheck
} from "lucide-react";

export default function SuperadminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, pending, users, admins, analytics
  const [users, setUsers] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [modalState, setModalState] = useState({
    isOpen: false,
    action: null, // 'reject', 'remove_admin', 'make_admin', 'approve', 'promote_superadmin'
    user: null,
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
  }, []);

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

  const fetchUsers = async () => {
    try {
      // Reusing the existing users endpoint to get all users
      const res = await fetch("/api/admin/users");
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      
      // Let's also fetch from the supadmin endpoints if necessary, but /api/admin/users returns { users: [...] }
      // Wait, let's actually just use /api/supadmin/users since we know it returns the full array
      const supRes = await fetch("/api/supadmin/users");
      const supData = await supRes.json();
      if (!supRes.ok) throw new Error(supData.message || "Failed to fetch users");

      setUsers(supData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const confirmAction = async () => {
    const { action, user } = modalState;
    setModalState({ ...modalState, isOpen: false });

    // Map the UI action names to the actual API endpoints requested
    const apiMap = {
      'approve': '/api/admin/approve',
      'reject': '/api/admin/reject',
      'make_admin': '/api/admin/make-admin',
      'remove_admin': '/api/admin/remove-admin',
      'promote_superadmin': '/api/admin/promote-superadmin'
    };

    const endpoint = apiMap[action];

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Action failed");
      }

      await fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const openModal = (action, user) => {
    let title = "";
    let message = "";

    switch (action) {
      case "approve":
        title = "Approve Admin";
        message = `Are you sure you want to approve ${user.name} as an administrator?`;
        break;
      case "reject":
        title = "Reject Pending Admin";
        message = `Are you sure you want to reject ${user.name}? This will delete their account.`;
        break;
      case "make_admin":
        title = "Promote to Admin";
        message = `Are you sure you want to promote ${user.name} to an administrator?`;
        break;
      case "remove_admin":
        title = "Remove Admin Role";
        message = `Are you sure you want to remove the admin role from ${user.name}? They will become a standard user.`;
        break;
      case "promote_superadmin":
        title = "Promote to Superadmin";
        message = `Are you sure you want to promote ${user.name} to Superadmin? They will have full system access.`;
        break;
    }

    setModalState({ isOpen: true, action, user, title, message });
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const pendingAdmins = filteredUsers.filter(u => u.role === "admin" && !u.isApproved);
  const activeAdmins = filteredUsers.filter(u => u.role === "admin" && u.isApproved);
  const regularUsers = filteredUsers.filter(u => u.role === "user");
  const superAdmins = filteredUsers.filter(u => u.role === "superadmin");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-600 dark:text-neutral-400 font-medium">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  // Define the columns based on active tab
  let displayUsers = [];
  if (activeTab === "pending") displayUsers = pendingAdmins;
  else if (activeTab === "users") displayUsers = filteredUsers;
  else if (activeTab === "admins") displayUsers = [...activeAdmins, ...superAdmins];

  return (
    <div className="admin-view min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-neutral-200 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#1E1E1E] hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400">
            Superadmin
          </h2>
          <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">System Control Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "dashboard" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 hover:text-gray-900 dark:hover:text-neutral-200"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "pending" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 hover:text-gray-900 dark:hover:text-neutral-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-4 h-4" /> Pending Approvals
            </div>
            {pendingAdmins.length > 0 && (
              <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 py-0.5 px-2 rounded-full text-xs">
                {pendingAdmins.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "users" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 hover:text-gray-900 dark:hover:text-neutral-200"
            }`}
          >
            <Users className="w-4 h-4" /> All Users
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "admins" ? "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400" : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 hover:text-gray-900 dark:hover:text-neutral-200"
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Admin Management
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "analytics" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 hover:text-gray-900 dark:hover:text-neutral-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Course Analytics
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/50 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 md:hidden">Superadmin Panel</h1>
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        {/* Dynamic Content Area */}
        <div className="p-6 md:p-8 flex-1 overflow-auto">
          
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={users.length} icon={<Users />} color="text-blue-500 dark:text-blue-400" />
                <StatCard title="Superadmins" value={superAdmins.length} icon={<ShieldAlert />} color="text-indigo-500 dark:text-indigo-400" />
                <StatCard title="Active Admins" value={activeAdmins.length} icon={<ShieldCheck />} color="text-violet-500 dark:text-violet-400" />
                <StatCard title="Pending Approvals" value={pendingAdmins.length} icon={<UserCheck />} color="text-amber-500 dark:text-amber-400" />
              </div>
            </div>
          )}

          {activeTab !== "dashboard" && activeTab !== "analytics" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold capitalize text-gray-900 dark:text-white">
                    {activeTab === "pending" ? "Pending Admins" : activeTab === "users" ? "All Users" : "Admin Management"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-neutral-500 mt-1">
                    Manage and control access levels for all system users
                  </p>
                </div>
                {/* Mobile Search */}
                <div className="relative w-full sm:hidden">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 dark:bg-neutral-900/80 text-gray-500 dark:text-neutral-400 border-b border-gray-200 dark:border-neutral-800">
                      <tr>
                        <th className="px-6 py-4 font-medium">User</th>
                        <th className="px-6 py-4 font-medium">Role</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Joined</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/50">
                      {displayUsers.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-neutral-500">
                            No users found in this category.
                          </td>
                        </tr>
                      ) : (
                        displayUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900 dark:text-neutral-200">{user.name}</div>
                              <div className="text-gray-500 dark:text-neutral-500 text-xs mt-0.5">{user.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                                user.role === "superadmin" ? "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20" :
                                user.role === "admin" ? "bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20" :
                                "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700"
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {(user.role === "admin" || user.role === "superadmin") ? (
                                user.isApproved ? (
                                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Approved
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pending
                                  </span>
                                )
                              ) : (
                                <span className="text-gray-400 dark:text-neutral-600 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-neutral-500 text-xs">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              {/* Pending actions */}
                              {activeTab === "pending" && (
                                <>
                                  <ActionButton 
                                    onClick={() => openModal('approve', user)} 
                                    icon={<Check className="w-3.5 h-3.5" />} 
                                    label="Approve" 
                                    color="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                                  />
                                  <ActionButton 
                                    onClick={() => openModal('reject', user)} 
                                    icon={<X className="w-3.5 h-3.5" />} 
                                    label="Reject" 
                                    color="bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                                  />
                                </>
                              )}

                              {/* Users actions */}
                              {activeTab === "users" && user.role === "user" && (
                                <ActionButton 
                                  onClick={() => openModal('make_admin', user)} 
                                  icon={<ShieldPlus className="w-3.5 h-3.5" />} 
                                  label="Make Admin" 
                                  color="bg-violet-500/10 text-violet-400 hover:bg-violet-500/20" 
                                />
                              )}
                              
                              {/* Admins & All Users Actions for promoting to superadmin */}
                              {(activeTab === "users" || activeTab === "admins") && user.role !== "superadmin" && user.isApproved && (
                                <ActionButton 
                                  onClick={() => openModal('promote_superadmin', user)} 
                                  icon={<ShieldAlert className="w-3.5 h-3.5" />} 
                                  label="Promote to Super" 
                                  color="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20" 
                                />
                              )}

                              {/* Remove admin action */}
                              {(activeTab === "admins" || activeTab === "users") && user.role === "admin" && user.isApproved && (
                                <ActionButton 
                                  onClick={() => openModal('remove_admin', user)} 
                                  icon={<ShieldMinus className="w-3.5 h-3.5" />} 
                                  label="Demote" 
                                  color="bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                                />
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Course Analytics</h2>
                  <p className="text-sm text-gray-500 dark:text-neutral-500 mt-1">
                    Upload performance broken down by Admin and Course.
                  </p>
                </div>
              </div>

              {analyticsData.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard 
                    title="Top Performing Admin" 
                    value={analyticsData[0]?.admin?.name || "N/A"} 
                    icon={<UserCheck />} 
                    color="text-emerald-500 dark:text-emerald-400" 
                  />
                  <StatCard 
                    title="Highest Upload Count" 
                    value={analyticsData[0]?.totalUploads || 0} 
                    icon={<BarChart3 />} 
                    color="text-amber-500 dark:text-amber-400" 
                  />
                </div>
              )}

              <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 dark:bg-neutral-900/80 text-gray-500 dark:text-neutral-400 border-b border-gray-200 dark:border-neutral-800">
                      <tr>
                        <th className="px-6 py-4 font-medium">Admin Name</th>
                        <th className="px-6 py-4 font-medium">Email</th>
                        <th className="px-6 py-4 font-medium">Course Name</th>
                        <th className="px-6 py-4 font-medium">Total Uploads</th>
                        <th className="px-6 py-4 font-medium">Notes</th>
                        <th className="px-6 py-4 font-medium">Papers</th>
                        <th className="px-6 py-4 font-medium">Assignments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/50">
                      {analyticsData.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-neutral-500">
                            No upload data found.
                          </td>
                        </tr>
                      ) : (
                        analyticsData.filter(row => {
                           if (!searchQuery) return true;
                           const term = searchQuery.toLowerCase();
                           return (row.admin?.name?.toLowerCase().includes(term) || row.admin?.email?.toLowerCase().includes(term));
                        }).map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-neutral-800/20 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-neutral-200">{row.admin?.name || "Unknown"}</td>
                            <td className="px-6 py-4 text-gray-500 dark:text-neutral-500">{row.admin?.email || "-"}</td>
                            <td className="px-6 py-4 text-gray-700 dark:text-neutral-300">{row.course?.name || "Unknown"}</td>
                            <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">{row.totalUploads}</td>
                            <td className="px-6 py-4 text-gray-600 dark:text-neutral-400">{row.notesCount}</td>
                            <td className="px-6 py-4 text-gray-600 dark:text-neutral-400">{row.papersCount}</td>
                            <td className="px-6 py-4 text-gray-600 dark:text-neutral-400">{row.assignmentsCount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Confirmation Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 pb-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{modalState.title}</h3>
              <p className="text-gray-600 dark:text-neutral-400 text-sm leading-relaxed">{modalState.message}</p>
            </div>
            <div className="p-6 pt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalState({ ...modalState, isOpen: false })}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg ${
                  ['reject', 'remove_admin'].includes(modalState.action) 
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20" 
                    : modalState.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                }`}
              >
                Confirm Match
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponents
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 p-5 rounded-xl flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-gray-50 dark:bg-neutral-800/50 ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-gray-500 dark:text-neutral-400 text-xs font-medium uppercase tracking-wider">{title}</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
      </div>
    </div>
  );
}

function ActionButton({ onClick, icon, label, color }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${color}`}
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}
