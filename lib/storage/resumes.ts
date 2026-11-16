import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { getSupabase } from "@/lib/db/supabase";
import { localStoreEnabled } from "@/lib/db/local";

const BUCKET = "resumes";
const LOCAL_DIR = path.join(process.cwd(), "data", "uploads", "resumes");

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

const TYPES: Record<string, { contentType: string; magic: number[] }> = {
  pdf: { contentType: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  docx: {
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    magic: [0x50, 0x4b, 0x03, 0x04], // zip
  },
  doc: { contentType: "application/msword", magic: [0xd0, 0xcf, 0x11, 0xe0] },
};

export class InvalidResumeError extends Error {}

function extensionOf(fileName: string): string {
  return (fileName.split(".").pop() || "").toLowerCase();
}

/** Checks size, extension and the file's leading bytes. Returns the content type. */
export function validateResume(fileName: string, bytes: Buffer): string {
  if (bytes.length === 0) throw new InvalidResumeError("The file is empty.");
  if (bytes.length > MAX_RESUME_BYTES) throw new InvalidResumeError("File size exceeds the 5MB limit.");

  const type = TYPES[extensionOf(fileName)];
  if (!type) throw new InvalidResumeError("Please upload a PDF, DOC or DOCX file.");

  const matches = type.magic.every((byte, index) => bytes[index] === byte);
  if (!matches) throw new InvalidResumeError("This file does not look like a valid PDF or Word document.");

  return type.contentType;
}

/** Stores the CV privately and returns its storage path. */
export async function saveResume(userId: string, fileName: string, bytes: Buffer): Promise<string> {
  const contentType = validateResume(fileName, bytes);
  const storagePath = `${userId}/${randomUUID()}.${extensionOf(fileName)}`;

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, { contentType });
    if (error) throw new Error(error.message);
    return storagePath;
  }

  if (!localStoreEnabled) {
    throw new Error("File storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  const target = path.join(LOCAL_DIR, storagePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
  return storagePath;
}

export type ResumeDownload =
  | { kind: "redirect"; url: string }
  | { kind: "file"; bytes: Buffer; contentType: string }
  | null;

/** A one-minute signed link in production, or the file itself in local development. */
export async function getResumeDownload(storagePath: string): Promise<ResumeDownload> {
  // Paths are always "<uuid>/<uuid>.<ext>"; reject anything else (e.g. "../").
  if (!/^[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\.(pdf|docx|doc)$/.test(storagePath)) return null;

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60);
    if (error || !data?.signedUrl) return null;
    return { kind: "redirect", url: data.signedUrl };
  }

  if (!localStoreEnabled) return null;
  const target = path.join(LOCAL_DIR, storagePath);
  if (!fs.existsSync(target)) return null;
  return {
    kind: "file",
    bytes: fs.readFileSync(target),
    contentType: TYPES[extensionOf(storagePath)].contentType,
  };
}
