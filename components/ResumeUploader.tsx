"use client";

import { useId, useRef, useState } from "react";
import { Upload, FileText, CheckCircle, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

const MAX_BYTES = 5 * 1024 * 1024;

export function checkResumeFile(file: File): string | null {
  if (!/\.(pdf|doc|docx)$/i.test(file.name)) return "Please upload a PDF, DOC or DOCX file.";
  if (file.size > MAX_BYTES) return "File size exceeds the 5MB limit.";
  return null;
}

/** Uploads a CV to the signed-in user's profile. Throws with a readable message on failure. */
export async function uploadResume(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/uploads/resume", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || "Upload failed. Please try again.");
  return data.user;
}

interface ResumeUploaderProps {
  /**
   * "profile" (default): the file is uploaded immediately to the signed-in
   * user's profile. "deferred": the chosen file is handed to the parent, which
   * uploads it later (used on the sign-up form, before the account exists).
   */
  mode?: "profile" | "deferred";
  onFilePicked?: (file: File | null) => void;
  label?: string;
}

export default function ResumeUploader({
  mode = "profile",
  onFilePicked,
  label = "CV / Resume (PDF or Word, max 5MB)",
}: ResumeUploaderProps) {
  const { user, login } = useAuth();
  const inputId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [pickedName, setPickedName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileName = mode === "profile" ? user?.resumeFileName || null : pickedName;

  const handleFile = async (file: File) => {
    setErrorMsg("");
    const problem = checkResumeFile(file);
    if (problem) {
      setErrorMsg(problem);
      return;
    }

    if (mode === "deferred") {
      setPickedName(file.name);
      onFilePicked?.(file);
      return;
    }

    setUploading(true);
    try {
      login(await uploadResume(file));
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setErrorMsg("");
    if (mode === "deferred") {
      setPickedName(null);
      onFilePicked?.(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    try {
      const res = await fetch("/api/uploads/resume", { method: "DELETE" });
      const data = await res.json();
      if (data.success) login(data.user);
      else setErrorMsg(data.error || "Could not remove your CV.");
    } catch {
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-bold text-slate-800">
        {label}
      </label>

      <div id={statusId} aria-live="polite">
        {errorMsg && (
          <p role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-sm text-sm text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </p>
        )}
        {uploading && (
          <p className="text-sm text-slate-700 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Uploading your CV…
          </p>
        )}
      </div>

      {fileName && !uploading && (
        <div className="flex items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-300 rounded-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-brand-green text-white rounded-sm flex items-center justify-center shrink-0" aria-hidden="true">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              {mode === "profile" && user ? (
                <a
                  href={`/api/files/resume?userId=${user.id}`}
                  className="text-sm font-bold text-slate-900 underline block truncate"
                >
                  {fileName}
                </a>
              ) : (
                <p className="text-sm font-bold text-slate-900 truncate">{fileName}</p>
              )}
              <span className="text-xs text-emerald-800 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                {mode === "profile" ? "Saved to your profile" : "Will be uploaded when you create your account"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-2 text-slate-600 hover:text-rose-700 rounded-sm shrink-0"
            aria-label={`Remove CV ${fileName}`}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* The real file input stays focusable; the dashed area is its visible label. */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={`relative border-2 border-dashed rounded-sm p-5 text-center transition-colors focus-within:border-brand-green ${
          isDragging ? "border-brand-green bg-emerald-50" : "border-slate-400 bg-slate-50 hover:bg-white"
        }`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          disabled={uploading}
          aria-describedby={statusId}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <Upload className="w-7 h-7 text-brand-green mx-auto mb-2" aria-hidden="true" />
        <p className="text-sm font-bold text-slate-900">
          {fileName ? "Choose a different file" : "Choose a file or drag it here"}
        </p>
        <p className="text-xs text-slate-600 mt-1">PDF, DOC or DOCX, up to 5MB</p>
      </div>
    </div>
  );
}
