import fs from "fs";
import path from "path";

export interface Job {
  id: string;
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
  postedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  locationArea: string;
  resumeUrl?: string;
  coverNote?: string;
  submittedAt: string;
}

export interface DatabaseSchema {
  jobs: Job[];
  categories: string[];
  locations: string[];
  applications: Application[];
}

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function readDB(): DatabaseSchema {
  try {
    const fileData = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(fileData);
  } catch (error) {
    console.error("Error reading db.json:", error);
    return { jobs: [], categories: [], locations: [], applications: [] };
  }
}

function writeDB(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to db.json:", error);
  }
}

export async function getJobs(filters?: {
  query?: string;
  locationArea?: string;
  category?: string;
  employmentType?: string;
}): Promise<Job[]> {
  const db = readDB();
  let jobs = db.jobs;

  if (filters) {
    const { query, locationArea, category, employmentType } = filters;

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

    if (locationArea && locationArea !== "ALL") {
      jobs = jobs.filter((job) =>
        job.locationArea.toLowerCase().includes(locationArea.toLowerCase())
      );
    }

    if (category && category !== "ALL") {
      jobs = jobs.filter(
        (job) => job.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (employmentType && employmentType !== "ALL") {
      jobs = jobs.filter((job) => job.employmentType === employmentType);
    }
  }

  // Sort featured first, then newest
  return jobs.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const db = readDB();
  const job = db.jobs.find((j) => j.slug === slug);
  return job || null;
}

export async function createJob(jobData: Omit<Job, "id" | "slug" | "postedAt">): Promise<Job> {
  const db = readDB();
  const id = `job-${Date.now()}`;
  
  // Generate SEO slug
  const slugBase = jobData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const locationSlug = jobData.locationArea
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = `${slugBase}-${locationSlug}-ilorin-${Date.now().toString().slice(-4)}`;

  const newJob: Job = {
    ...jobData,
    id,
    slug,
    postedAt: new Date().toISOString(),
  };

  db.jobs.unshift(newJob);
  writeDB(db);
  return newJob;
}

export async function submitApplication(appData: Omit<Application, "id" | "submittedAt">): Promise<Application> {
  const db = readDB();
  const newApp: Application = {
    ...appData,
    id: `app-${Date.now()}`,
    submittedAt: new Date().toISOString(),
  };

  db.applications.push(newApp);
  writeDB(db);
  return newApp;
}

export async function getCategories(): Promise<string[]> {
  const db = readDB();
  return db.categories;
}

export async function getLocations(): Promise<string[]> {
  const db = readDB();
  return db.locations;
}
