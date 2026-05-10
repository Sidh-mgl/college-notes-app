"use client";

import { useRef, useState, useCallback } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

/**
 * DragDropFileInput
 * Props:
 *  - file        : currently selected File object (or null)
 *  - onChange    : (File | null) => void
 *  - accentColor : tailwind color name, e.g. "indigo" | "blue" | "green"  (default "indigo")
 *  - disabled    : boolean
 */
export default function DragDropFileInput({
  file,
  onChange,
  accentColor = "indigo",
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const accent = {
    indigo: {
      border: "border-indigo-400 dark:border-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      icon: "text-indigo-500 dark:text-indigo-400",
      text: "text-indigo-600 dark:text-indigo-400",
      ring: "ring-indigo-400",
      badgeBg: "bg-indigo-100 dark:bg-indigo-900/40",
      badgeText: "text-indigo-700 dark:text-indigo-300",
    },
    blue: {
      border: "border-blue-400 dark:border-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      icon: "text-blue-500 dark:text-blue-400",
      text: "text-blue-600 dark:text-blue-400",
      ring: "ring-blue-400",
      badgeBg: "bg-blue-100 dark:bg-blue-900/40",
      badgeText: "text-blue-700 dark:text-blue-300",
    },
    green: {
      border: "border-green-400 dark:border-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
      icon: "text-green-500 dark:text-green-400",
      text: "text-green-600 dark:text-green-400",
      ring: "ring-green-400",
      badgeBg: "bg-green-100 dark:bg-green-900/40",
      badgeText: "text-green-700 dark:text-green-300",
    },
  }[accentColor] ?? {};

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile && droppedFile.type === "application/pdf") {
        onChange(droppedFile);
      }
    },
    [disabled, onChange]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    // Only reset when leaving the dropzone itself (not child elements)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) onChange(selected);
    // Reset input value so the same file can be re-selected after clearing
    e.target.value = "";
  };

  const clearFile = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && inputRef.current?.click()}
      className={[
        "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 cursor-pointer transition-all duration-200 select-none",
        isDragging
          ? `${accent.border} ${accent.bg} scale-[1.02] ring-2 ${accent.ring}/40`
          : "border-gray-200 dark:border-gray-700 hover:" + accent.border + " hover:" + accent.bg,
        disabled ? "opacity-50 cursor-not-allowed" : "",
        file ? accent.bg : "bg-white dark:bg-[#121212]",
      ].join(" ")}
      style={{ minHeight: "96px" }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />

      {file ? (
        /* ── File selected state ── */
        <div className="flex items-center gap-3 w-full">
          <div className={`p-2 rounded-lg ${accent.badgeBg} shrink-0`}>
            <FileText className={`w-6 h-6 ${accent.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold truncate ${accent.text}`}>
              {file.name}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {formatSize(file.size)} · PDF
            </p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="shrink-0 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* ── Empty / drag state ── */
        <>
          <div
            className={`p-3 rounded-full transition-transform duration-200 ${accent.badgeBg} ${isDragging ? "scale-110" : ""}`}
          >
            <UploadCloud
              className={`w-7 h-7 transition-transform duration-200 ${accent.icon} ${isDragging ? "animate-bounce" : ""}`}
            />
          </div>
          <div className="text-center leading-snug">
            <p className={`text-sm font-semibold ${accent.text}`}>
              {isDragging ? "Drop PDF here" : "Drag & drop a PDF"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              or{" "}
              <span className={`underline font-medium ${accent.text}`}>
                click to browse
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
