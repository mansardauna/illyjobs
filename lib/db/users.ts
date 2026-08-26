import fs from "fs";
import path from "path";

export type UserRole = "JOB_SEEKER" | "EMPLOYER" | "ADMIN";
export type PlanTier = "FREE" | "PRO";

export interface UserAccount {
  id: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  planTier: PlanTier;
  fullName?: string;
  companyName?: string;
  companyLogo?: string;
  headline?: string;
  locationArea?: string;
  address?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  skills?: string[];
  isVerified?: boolean;
  createdAt: string;
}

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function readDB() {
  try {
    const fileData = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(fileData);
  } catch (error) {
    return { users: [] };
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing users to db.json:", error);
  }
}

export async function getUserByEmail(email: string): Promise<UserAccount | null> {
  const db = readDB();
  const user = (db.users || []).find((u: UserAccount) => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
}

export async function getUserById(id: string): Promise<UserAccount | null> {
  const db = readDB();
  const user = (db.users || []).find((u: UserAccount) => u.id === id);
  return user || null;
}

export async function registerUser(userData: {
  email: string;
  password: string;
  role: UserRole;
  fullName?: string;
  companyName?: string;
  phone?: string;
  locationArea?: string;
}): Promise<UserAccount> {
  const db = readDB();
  db.users = db.users || [];

  const existing = db.users.find((u: UserAccount) => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const newUser: UserAccount = {
    id: `usr-${Date.now()}`,
    email: userData.email,
    passwordHash: `hash_${userData.password}`, // Simple hash placeholder
    role: userData.role,
    planTier: "FREE",
    fullName: userData.fullName || (userData.role === "EMPLOYER" ? userData.companyName : "New User"),
    companyName: userData.companyName,
    phone: userData.phone,
    locationArea: userData.locationArea || "Tanke / Unilorin Axis",
    isVerified: userData.role === "EMPLOYER" ? false : undefined,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDB(db);
  return newUser;
}

export async function updateUserPlan(userId: string, planTier: PlanTier): Promise<UserAccount | null> {
  const db = readDB();
  const userIndex = (db.users || []).findIndex((u: UserAccount) => u.id === userId);
  if (userIndex === -1) return null;

  db.users[userIndex].planTier = planTier;
  writeDB(db);
  return db.users[userIndex];
}

export async function updateUserResume(userId: string, resumeUrl: string, fileName: string): Promise<UserAccount | null> {
  const db = readDB();
  const userIndex = (db.users || []).findIndex((u: UserAccount) => u.id === userId);
  if (userIndex === -1) return null;

  db.users[userIndex].resumeUrl = resumeUrl;
  db.users[userIndex].resumeFileName = fileName;
  writeDB(db);
  return db.users[userIndex];
}

export async function getSeekerResumes(locationArea?: string, query?: string): Promise<UserAccount[]> {
  const db = readDB();
  let seekers = (db.users || []).filter((u: UserAccount) => u.role === "JOB_SEEKER" && u.resumeUrl);

  if (locationArea && locationArea !== "ALL") {
    seekers = seekers.filter((s: UserAccount) => s.locationArea?.toLowerCase().includes(locationArea.toLowerCase()));
  }

  if (query && query.trim() !== "") {
    const q = query.toLowerCase();
    seekers = seekers.filter(
      (s: UserAccount) =>
        s.fullName?.toLowerCase().includes(q) ||
        s.headline?.toLowerCase().includes(q) ||
        s.skills?.some((sk) => sk.toLowerCase().includes(q))
    );
  }

  return seekers;
}
