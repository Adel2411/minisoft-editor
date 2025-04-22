"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Upload, X, FileText } from "lucide-react";

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (content: string, fileName: string) => void;
  theme: "dark" | "light";
}

export default function FileModal({
  isOpen,
  onClose,
  onFileUpload,
  theme,
}: FileModalProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleFileUpload = (file: File) => {
    if (file && file.name.endsWith(".ms")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onFileUpload(e.target.result as string, file.name);
          onClose();

          // Show success notification
          showNotification(`File "${file.name}" loaded successfully!`);
        }
      };
      reader.readAsText(file);
    } else {
      // Show error notification
      showNotification("Please upload a .ms file", true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const showNotification = (message: string, isError = false) => {
    const notification = document.createElement("div");
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 transition-opacity duration-300 flex items-center gap-2 ${
      isError
        ? theme === "dark"
          ? "bg-red-900 text-red-100 border border-red-800"
          : "bg-red-100 text-red-800 border border-red-200"
        : theme === "dark"
          ? "bg-[#312c28] text-[#f3ebe7] border border-[#3e3632]"
          : "bg-white text-[#212529] border border-[#efe0d9]"
    }`;

    // Add icon
    const icon = document.createElement("span");
    if (isError) {
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    }

    const textNode = document.createElement("span");
    textNode.textContent = message;

    notification.appendChild(icon);
    notification.appendChild(textNode);
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        ref={modalRef}
        className={`w-full max-w-md rounded-lg shadow-xl ${theme === "dark" ? "bg-[#262220]" : "bg-white"}`}
      >
        {/* Modal header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
          }`}
        >
          <h3
            className={`text-lg font-medium ${
              theme === "dark" ? "text-[#f3ebe7]" : "text-[#212529]"
            }`}
          >
            Open File
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#fff1ec] text-[#868e96] hover:text-[#212529]"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-4">
          <div
            className={`relative flex items-center justify-center p-8 border-2 border-dashed rounded-md transition-colors cursor-pointer mb-4 ${
              isDragging
                ? theme === "dark"
                  ? "border-[#e86f42] bg-[#e86f42]/10"
                  : "border-[#e05d30] bg-[#e05d30]/10"
                : theme === "dark"
                  ? "border-[#3e3632] hover:border-[#e86f42]"
                  : "border-[#efe0d9] hover:border-[#e05d30]"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".ms"
              className="sr-only"
            />
            <div className="flex flex-col items-center gap-3">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  theme === "dark" ? "bg-[#312c28]" : "bg-[#fff1ec]"
                }`}
              >
                <Upload
                  size={28}
                  className={`transition-colors ${theme === "dark" ? "text-[#d9cec9]" : "text-[#495057]"}`}
                />
              </div>
              <div className="text-center">
                <p
                  className={`text-sm font-medium ${theme === "dark" ? "text-[#f3ebe7]" : "text-[#212529]"}`}
                >
                  Upload a .ms file
                </p>
                <p
                  className={`text-xs ${theme === "dark" ? "text-[#b5a9a2]" : "text-[#868e96]"}`}
                >
                  Drag and drop or click to browse
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                theme === "dark"
                  ? "bg-[#312c28] hover:bg-[#3e3632] text-[#d9cec9]"
                  : "bg-[#fff1ec] hover:bg-[#efe0d9] text-[#495057]"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                theme === "dark"
                  ? "bg-[#e86f42] hover:bg-[#f39c78] text-white"
                  : "bg-[#e05d30] hover:bg-[#cb502a] text-white"
              }`}
            >
              <FileText size={16} />
              Browse Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
