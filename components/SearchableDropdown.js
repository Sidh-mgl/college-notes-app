"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

export default function SearchableDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Click away listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setSearchQuery(""); // Reset search on close
    }
  }, [isOpen]);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt._id === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border p-3 rounded-xl outline-none transition-all ${
          disabled 
            ? "bg-gray-100 dark:bg-[#2A2A2A] border-gray-200 dark:border-gray-700 cursor-not-allowed text-gray-400 dark:text-gray-500" 
            : "bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-gray-700 hover:border-indigo-400 flex-shrink-0 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
        } text-left`}
      >
        <span className={`block truncate ${selectedOption ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-indigo-500" : "text-gray-400 dark:text-gray-500"}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col max-h-72">
          <div className="p-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-[#2A2A2A]">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-2" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 py-1.5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="overflow-y-auto p-1 flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option._id}
                  type="button"
                  onClick={() => {
                    onChange(option._id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    value === option._id 
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-semibold" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333333] hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span className="truncate">{option.name}</span>
                </button>
              ))
            ) : (
               <div className="px-4 py-6 text-sm text-gray-500 text-center flex flex-col items-center gap-2">
                 <span>No results found</span>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
