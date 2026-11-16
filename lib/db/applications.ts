import { randomUUID } from "crypto";
import { getSupabase } from "./supabase";
import { readLocalDB, writeLocalDB } from "./local";
import type { ApplicationStatus } from "@/lib/constants";

export type { ApplicationStatus };

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  locationArea: string;
  resumePath?: string;
  resumeFileName?: string;
  coverNote?: string;
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
}

export class AlreadyAppliedError extends Error {
  constructor() {
    super("You have already applied for this job.");
  }
}

function fromRow(row: any): Application {
  return {
    id: row.id,
    jobId: row.job_id,
    applicantId: row.applicant_id,
    applicantName: row.applicant_name,
    applicantEmail: row.applicant_email,
    applicantPhone: row.applicant_phone,
    locationArea: row.location_area ?? "Ilorin",
    resumePath: row.resume_path ?? undefined,
    resumeFileName: row.resume_file_name ?? undefined,
    coverNote: row.cover_note ?? undefined,
    status: row.status,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  };
}

function newestFirst(a: Application, b: Application) {
  return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
}

export async function createApplication(
  data: Omit<Application, "id" | "status" | "submittedAt" | "updatedAt">
): Promise<Application> {
  const now = new Date().toISOString();
  const application: Application = {
    ...data,
    id: randomUUID(),
    status: "SUBMITTED",
    submittedAt: now,
    updatedAt: now,
  };

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("applications").insert({
      id: application.id,
      job_id: application.jobId,
      applicant_id: application.applicantId,
      applicant_name: application.applicantName,
      applicant_email: application.applicantEmail,
      applicant_phone: application.applicantPhone,
      location_area: application.locationArea,
      resume_path: application.resumePath ?? null,
      resume_file_name: application.resumeFileName ?? null,
      cover_note: application.coverNote ?? null,
      status: application.status,
      submitted_at: application.submittedAt,
      updated_at: application.updatedAt,
    });
    if (error) {
      if (error.code === "23505") throw new AlreadyAppliedError();
      throw new Error(error.message);
    }
    return application;
  }

  const existing = (readLocalDB().applications as Application[]).some(
    (a) => a.jobId === application.jobId && a.applicantId === application.applicantId
  );
  if (existing) throw new AlreadyAppliedError();

  writeLocalDB((db) => {
    db.applications.push(application);
  });
  return application;
}

export async function getApplicationById(id: string): Promise<Application | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from("applications").select("*").eq("id", id).maybeSingle();
    // A malformed id (not a UUID) is simply "not found".
    if (error) return null;
    return data ? fromRow(data) : null;
  }
  return (readLocalDB().applications as Application[]).find((a) => a.id === id) || null;
}

export async function getApplicationsByApplicant(applicantId: string): Promise<Application[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("applicant_id", applicantId)
      .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(fromRow);
  }
  return (readLocalDB().applications as Application[])
    .filter((a) => a.applicantId === applicantId)
    .sort(newestFirst);
}

export async function getApplicationsByJobIds(jobIds: string[]): Promise<Application[]> {
  if (jobIds.length === 0) return [];
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .in("job_id", jobIds)
      .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(fromRow);
  }
  return (readLocalDB().applications as Application[])
    .filter((a) => jobIds.includes(a.jobId))
    .sort(newestFirst);
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<Application | null> {
  const updatedAt = new Date().toISOString();
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("applications")
      .update({ status, updated_at: updatedAt })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromRow(data) : null;
  }

  let updated: Application | null = null;
  writeLocalDB((db) => {
    const application = db.applications.find((a: Application) => a.id === id);
    if (application) {
      application.status = status;
      application.updatedAt = updatedAt;
      updated = application;
    }
  });
  return updated;
}
