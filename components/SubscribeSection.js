"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function SubscribeSection({ source = "homepage" }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ show: true, message: data.error || "An error occurred", type: "error" });
      } else {
        setToast({ show: true, message: data.message || "Subscribed successfully!", type: "success" });
        setEmail(""); // Clear input on success
      }
    } catch (error) {
      setToast({ show: true, message: "Network error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative my-12">
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${
            toast.type === "success" 
            ? "bg-emerald-50/95 border-emerald-200 text-emerald-800" 
            : "bg-rose-50/95 border-rose-200 text-rose-800"
          }`}
        >
          {toast.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Main Section */}
      <div className="bg-white/60 dark:bg-[#12121e] rounded-[2rem] py-14 px-6 md:px-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden border border-white/80 dark:border-white/5 backdrop-blur-xl transition-all duration-500">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-300/30 dark:bg-indigo-600/20 rounded-full filter blur-[100px] transition-all duration-500"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-pink-300/30 dark:bg-purple-600/20 rounded-full filter blur-[100px] transition-all duration-500"></div>
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] dark:text-white mb-5 tracking-tight transition-colors duration-500">
            Stay Updated
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-10 max-w-lg mx-auto leading-relaxed transition-colors duration-500">
            Get notified when new notes, papers, and assignments are uploaded.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto">
            <div className="w-full relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-purple-100/50 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-500/50 focus:bg-white dark:focus:bg-white/10 transition-all duration-300 disabled:opacity-50 font-medium shadow-sm dark:shadow-none backdrop-blur-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transform hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(217,70,239,0.5)] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none whitespace-nowrap flex items-center justify-center min-w-[140px]"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
          <p className="mt-6 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 transition-colors duration-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            No spam. Only useful updates.
          </p>
        </div>
      </div>
    </div>
  );
}
