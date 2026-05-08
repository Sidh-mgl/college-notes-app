"use client";

import { useState, useEffect } from "react";
import { Link2, Check } from "lucide-react";

export default function ShareResources() {
  const [url, setUrl] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    // Get the current page URL dynamically
    setUrl(window.location.href);
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000); // 3 seconds
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback
      showToast("Could not copy link");
    }
  };

  const handleShare = (platform) => {
    const encodedURL = encodeURIComponent(url);

    if (platform === "copy") {
      copyToClipboard();
      return;
    }

    if (platform === "instagram") {
      copyToClipboard();
      showToast("Link copied. Paste in Instagram");
      // Optionally open instagram.com
      // window.open("https://instagram.com", "_blank");
      return;
    }

    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedURL}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodedURL}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedURL}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  // SVGs for social platforms since lucide may lack brand icons
  const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );

  const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send">
      <path d="m22 2-7 20-4-9-9-4Z"></path>
      <path d="M22 2 11 13"></path>
    </svg>
  );

  const LinkedInIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect width="4" height="12" x="2" y="9"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  );

  const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
    </svg>
  );

  return (
    <div className="relative max-w-6xl w-full mx-auto px-4 mt-8 mb-8">
      <div className="bg-gradient-to-br from-[#ffffff] to-[#faf5ff] dark:from-[#1E1E1E] dark:to-[#1a1a1a] rounded-[20px] p-[25px] sm:p-8 shadow-[0_10px_30px_rgba(124,58,237,0.15)] dark:shadow-none border border-[#7c3aed]/10 w-[90%] max-w-[800px] mx-auto relative z-10 flex flex-col md:flex-row items-center justify-center gap-[30px]">

        {/* GIF on the left taking up major space */}
        <div className="w-full sm:w-[45%] shrink-0 flex justify-center md:justify-end">
          <img src="/cry.gif" alt="Crying Animation" className="w-full max-w-[320px] h-auto rounded-xl shadow-sm object-cover" loop="true" />
        </div>

        {/* Title and Buttons on the right */}
        <div className="w-full sm:w-[55%] flex flex-col items-center sm:items-start text-center sm:text-left">
          <h3 className="text-[24px] mb-[18px] font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#7c3aed] to-[#ec4899] leading-[1.3]">
            Share these resources with your<br className="hidden sm:block" />friends
          </h3>

          <div className="flex flex-col items-center sm:items-start gap-3 w-full">
            {/* First Row (3 Buttons) */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-2.5">
              {/* Copy Link */}
              <button
                onClick={() => handleShare("copy")}
                aria-label="Copy to clipboard"
                title="Copy link"
                className="flex items-center justify-center shrink-0 w-full sm:w-auto gap-1.5 bg-[#4b5563] hover:bg-[#374151] text-white px-4 py-2 rounded-[10px] text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_8px_20px_rgba(124,58,237,0.3)] active:scale-95 whitespace-nowrap"
              >
                <Link2 className="w-4 h-4" />
                <span>Copy Link</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleShare("whatsapp")}
                aria-label="Share on WhatsApp"
                title="Share on WhatsApp"
                className="flex items-center justify-center shrink-0 w-full sm:w-auto gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 rounded-[10px] text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_8px_20px_rgba(124,58,237,0.3)] active:scale-95 whitespace-nowrap"
              >
                <WhatsAppIcon />
                <span>WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                onClick={() => handleShare("telegram")}
                aria-label="Share on Telegram"
                title="Share on Telegram"
                className="flex items-center justify-center shrink-0 w-full sm:w-auto gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-[10px] text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_8px_20px_rgba(124,58,237,0.3)] active:scale-95 whitespace-nowrap"
              >
                <TelegramIcon />
                <span>Telegram</span>
              </button>
            </div>

            {/* Second Row (2 Buttons) */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-2.5">
              {/* LinkedIn */}
              <button
                onClick={() => handleShare("linkedin")}
                aria-label="Share on LinkedIn"
                title="Share on LinkedIn"
                className="flex items-center justify-center shrink-0 w-full sm:w-auto gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-[10px] text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_8px_20px_rgba(124,58,237,0.3)] active:scale-95 whitespace-nowrap"
              >
                <LinkedInIcon />
                <span>LinkedIn</span>
              </button>

              {/* Instagram */}
              <button
                onClick={() => handleShare("instagram")}
                aria-label="Share on Instagram"
                title="Share on Instagram (Copies link)"
                className="flex items-center justify-center shrink-0 w-full sm:w-auto gap-1.5 bg-gradient-to-tr from-[#ec4899] to-[#7c3aed] hover:from-[#db2777] hover:to-[#6d28d9] text-white px-4 py-2 rounded-[10px] text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_8px_20px_rgba(124,58,237,0.3)] active:scale-95 whitespace-nowrap"
              >
                <InstagramIcon />
                <span>Instagram</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-neutral-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-neutral-700 flex items-center gap-3">
            <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-full">
              <Check className="w-4 h-4" />
            </div>
            <p className="font-medium text-sm">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
