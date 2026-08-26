"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, Trash2, AlertCircle } from "lucide-react";

interface ResumeUploaderProps {
  initialFileUrl?: string;
  initialFileName?: string;
  onFileSelect: (fileUrl: string, fileName: string) => void;
}

export default function ResumeUploader({
  initialFileUrl,
  initialFileName,
  onFileSelect,
}: ResumeUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(initialFileName || null);
  const [fileUrl, setFileUrl] = useState<string | null>(initialFileUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMsg("");
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      setErrorMsg("Please upload a PDF or DOCX format resume.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB limit.");
      return;
    }

    // Mock upload URL generation
    const mockUrl = `/uploads/resumes/${file.name.replace(/\s+/g, "_")}`;
    setFileName(file.name);
    setFileUrl(mockUrl);
    onFileSelect(mockUrl, file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setFileName(null);
    setFileUrl(null);
    onFileSelect("", "");
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-900 mb-1">
        Resume / CV File (PDF or DOCX) *
      </label>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-sm text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {fileName ? (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-300 rounded-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-sm flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 line-clamp-1">{fileName}</p>
              <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Resume Ready for Employers
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-2 text-slate-500 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-sm"
            aria-label="Remove uploaded resume"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-emerald-600 bg-emerald-50"
              : "border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-white"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-900">
            Click or drag & drop your resume CV here
          </p>
          <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX (Max 5MB)</p>
        </div>
      )}
    </div>
  );
}
