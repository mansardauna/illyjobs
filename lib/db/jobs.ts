import { randomUUID } from "crypto";
import { CATEGORIES, LOCATIONS } from "@/lib/constants";
import { getSupabase } from "./supabase";
import { readLocalDB, writeLocalDB } from "./local";

export interface Job {
  id: string;
  employerId?: string;
  title: string;
  slug: string;
  company: string;
  companyLogo?: string;
  locationArea: string;
  address?: string;
  category: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "REMOTE";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  description: string;
  requirements: string[];
  preferredChannel: "PLATFORM" | "WHATSAPP" | "EMAIL";
  whatsappPhone?: string;
  contactEmail?: string;
  isVerified: boolean;
  isFeatured: boolean;
  isProEmployer?: boolean;
  status?: JobStatus;
  postedAt: string;
  /** When the listing stops accepting applications. Undefined = no expiry (demo data). */
  closesAt?: string;
}

export type JobStatus = "OPEN" | "CLOSED";

export const JOB_LISTING_DAYS = 30;

/** A job is live when it is open and has not passed its closing date. */
export function isJobActive(job: Job): boolean {
  if (job.status === "CLOSED") return false;
  if (job.closesAt && new Date(job.closesAt).getTime() < Date.now()) return false;
  return true;
}

function jobFromRow(row: any): Job {
  return {
    id: row.id,
    employerId: row.employer_id ?? undefined,
    title: row.title,
    slug: row.slug,
    company: row.company,
    companyLogo: row.company_logo ?? undefined,
    locationArea: row.location_area,
    address: row.address ?? undefined,
    category: row.category,
    employmentType: row.employment_type,
    salaryMin: row.salary_min ?? undefined,
    salaryMax: row.salary_max ?? undefined,
    salaryCurrency: row.salary_currency,
    description: row.description,
    requirements: row.requirements || [],
    preferredChannel: row.preferred_channel,
    whatsappPhone: row.whatsapp_phone ?? undefined,
    contactEmail: row.contact_email ?? undefined,
    isVerified: Boolean(row.is_verified),
    isFeatured: Boolean(row.is_featured),
    isProEmployer: Boolean(row.is_pro_employer),
    status: row.status === "CLOSED" ? "CLOSED" : "OPEN",
    postedAt: row.posted_at,
    closesAt: row.closes_at ?? undefined,
  };
}

function jobToRow(job: Job) {
  return {
    id: job.id,
    employer_id: job.employerId ?? null,
    title: job.title,
    slug: job.slug,
    company: job.company,
    company_logo: job.companyLogo ?? null,
    location_area: job.locationArea,
    address: job.address ?? null,
    category: job.category,
    employment_type: job.employmentType,
    salary_min: job.salaryMin ?? null,
    salary_max: job.salaryMax ?? null,
    salary_currency: job.salaryCurrency,
    description: job.description,
    requirements: job.requirements,
    preferred_channel: job.preferredChannel,
    whatsapp_phone: job.whatsappPhone ?? null,
    contact_email: job.contactEmail ?? null,
    is_verified: job.isVerified,
    is_featured: job.isFeatured,
    is_pro_employer: Boolean(job.isProEmployer),
    status: job.status || "OPEN",
    posted_at: job.postedAt,
    closes_at: job.closesAt,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getJobs(filters?: {
  query?: string;
  locationArea?: string;
  category?: string;
  employmentType?: string;
}): Promise<Job[]> {
  const { query, locationArea, category, employmentType } = filters || {};
  let jobs: Job[];

  const supabase = getSupabase();
  if (supabase) {
    let request = supabase
      .from("jobs")
      .select("*")
      .eq("status", "OPEN")
      .gt("closes_at", new Date().toISOString())
      .order("posted_at", { ascending: false })
      .limit(500);
    if (locationArea && locationArea !== "ALL") request = request.ilike("location_area", `%${locationArea}%`);
    if (category && category !== "ALL") request = request.ilike("category", category);
    if (employmentType && employmentType !== "ALL") request = request.eq("employment_type", employmentType);

    const { data, error } = await request;
    if (error) throw new Error(error.message);
    jobs = (data || []).map(jobFromRow);
  } else {
    jobs = (readLocalDB().jobs as Job[]).filter(isJobActive);
    if (locationArea && locationArea !== "ALL") {
      jobs = jobs.filter((job) => job.locationArea.toLowerCase().includes(locationArea.toLowerCase()));
    }
    if (category && category !== "ALL") {
      jobs = jobs.filter((job) => job.category.toLowerCase() === category.toLowerCase());
    }
    if (employmentType && employmentType !== "ALL") {
      jobs = jobs.filter((job) => job.employmentType === employmentType);
    }
  }

  if (query && query.trim() !== "") {
    const q = query.toLowerCase();
    jobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q)
    );
  }

  // Featured first, then newest
  return jobs.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from("jobs").select("*").eq("slug", slug).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? jobFromRow(data) : null;
  }
  return (readLocalDB().jobs as Job[]).find((j) => j.slug === slug) || null;
}

export async function getJobById(id: string): Promise<Job | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
    // A malformed id (not a UUID) is simply "not found".
    if (error) return null;
    return data ? jobFromRow(data) : null;
  }
  return (readLocalDB().jobs as Job[]).find((j) => j.id === id) || null;
}

/** Number of live listings, used for the free plan limit. */
export async function countActiveJobsByEmployer(employerId: string): Promise<number> {
  const supabase = getSupabase();
  if (supabase) {
    const { count, error } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("employer_id", employerId)
      .eq("status", "OPEN")
      .gt("closes_at", new Date().toISOString());
    if (error) throw new Error(error.message);
    return count || 0;
  }
  return (readLocalDB().jobs as Job[]).filter((j) => j.employerId === employerId && isJobActive(j)).length;
}

export async function getJobsByIds(ids: string[]): Promise<Job[]> {
  const unique = Array.from(new Set(ids));
  if (unique.length === 0) return [];
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from("jobs").select("*").in("id", unique);
    if (error) throw new Error(error.message);
    return (data || []).map(jobFromRow);
  }
  return (readLocalDB().jobs as Job[]).filter((j) => unique.includes(j.id));
}

/** All of an employer's jobs, open or closed, newest first. */
export async function getJobsByEmployer(employerId: string): Promise<Job[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("employer_id", employerId)
      .order("posted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(jobFromRow);
  }
  return (readLocalDB().jobs as Job[])
    .filter((j) => j.employerId === employerId)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}

/** Closing hides the job; reopening lists it for another 30 days. */
export async function updateJobStatus(id: string, status: JobStatus): Promise<Job | null> {
  const changes: { status: JobStatus; closesAt?: string } = { status };
  if (status === "OPEN") {
    changes.closesAt = new Date(Date.now() + JOB_LISTING_DAYS * 86400000).toISOString();
  }

  const supabase = getSupabase();
  if (supabase) {
    const row: any = { status };
    if (changes.closesAt) row.closes_at = changes.closesAt;
    const { data, error } = await supabase.from("jobs").update(row).eq("id", id).select("*").maybeSingle();
    if (error) throw new Error(error.message);
    return data ? jobFromRow(data) : null;
  }

  let updated: Job | null = null;
  writeLocalDB((db) => {
    const job = db.jobs.find((j: Job) => j.id === id);
    if (job) {
      Object.assign(job, changes);
      updated = job;
    }
  });
  return updated;
}

export async function createJob(
  jobData: Omit<Job, "id" | "slug" | "postedAt" | "status" | "closesAt">
): Promise<Job> {
  const id = randomUUID();
  const slug = `${slugify(jobData.title)}-${slugify(jobData.locationArea)}-ilorin-${id.slice(0, 6)}`;

  const newJob: Job = {
    ...jobData,
    id,
    slug,
    status: "OPEN",
    postedAt: new Date().toISOString(),
    closesAt: new Date(Date.now() + JOB_LISTING_DAYS * 86400000).toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("jobs").insert(jobToRow(newJob));
    if (error) throw new Error(error.message);
    return newJob;
  }

  writeLocalDB((db) => {
    db.jobs.unshift(newJob);
  });
  return newJob;
}

export async function getCategories(): Promise<string[]> {
  return CATEGORIES;
}

export async function getLocations(): Promise<string[]> {
  return LOCATIONS;
}
