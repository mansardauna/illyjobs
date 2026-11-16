import { randomUUID } from "crypto";
import { hashPassword } from "@/lib/auth/password";
import { getSupabase } from "./supabase";
import { readLocalDB, writeLocalDB } from "./local";

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

export type SafeUser = Omit<UserAccount, "passwordHash">;

export function toSafeUser(user: UserAccount): SafeUser {
  const { passwordHash, ...safe } = user;
  return safe;
}

function fromRow(row: any): UserAccount {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone ?? undefined,
    passwordHash: row.password_hash,
    role: row.role,
    planTier: row.plan_tier,
    fullName: row.full_name ?? undefined,
    companyName: row.company_name ?? undefined,
    companyLogo: row.company_logo ?? undefined,
    headline: row.headline ?? undefined,
    locationArea: row.location_area ?? undefined,
    address: row.address ?? undefined,
    resumeUrl: row.resume_url ?? undefined,
    resumeFileName: row.resume_file_name ?? undefined,
    skills: row.skills ?? undefined,
    isVerified: row.is_verified ?? undefined,
    createdAt: row.created_at,
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getUserByEmail(email: string): Promise<UserAccount | null> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from("users").select("*").eq("email", normalized).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromRow(data) : null;
  }
  const user = readLocalDB().users.find((u: UserAccount) => normalizeEmail(u.email) === normalized);
  return user || null;
}

export async function getUsersByIds(ids: string[]): Promise<UserAccount[]> {
  const unique = Array.from(new Set(ids));
  if (unique.length === 0) return [];
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from("users").select("*").in("id", unique);
    if (error) throw new Error(error.message);
    return (data || []).map(fromRow);
  }
  return readLocalDB().users.filter((u: UserAccount) => unique.includes(u.id));
}

export async function getUserById(id: string): Promise<UserAccount | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromRow(data) : null;
  }
  const user = readLocalDB().users.find((u: UserAccount) => u.id === id);
  return user || null;
}

export class EmailTakenError extends Error {
  constructor() {
    super("An account with this email already exists.");
  }
}

export async function registerUser(userData: {
  email: string;
  password: string;
  role: "JOB_SEEKER" | "EMPLOYER";
  fullName?: string;
  companyName?: string;
  phone?: string;
  locationArea?: string;
}): Promise<UserAccount> {
  const email = normalizeEmail(userData.email);
  if (await getUserByEmail(email)) throw new EmailTakenError();

  const isEmployer = userData.role === "EMPLOYER";
  const newUser: UserAccount = {
    id: randomUUID(),
    email,
    passwordHash: await hashPassword(userData.password),
    role: userData.role,
    planTier: "FREE",
    fullName: userData.fullName || (isEmployer ? userData.companyName : "New User"),
    companyName: isEmployer ? userData.companyName : undefined,
    phone: userData.phone,
    locationArea: userData.locationArea || "Tanke / Unilorin Axis",
    isVerified: isEmployer ? false : undefined,
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("users").insert({
      id: newUser.id,
      email: newUser.email,
      phone: newUser.phone ?? null,
      password_hash: newUser.passwordHash,
      role: newUser.role,
      plan_tier: newUser.planTier,
      full_name: newUser.fullName ?? null,
      company_name: newUser.companyName ?? null,
      location_area: newUser.locationArea ?? null,
      is_verified: newUser.isVerified ?? false,
      created_at: newUser.createdAt,
    });
    if (error) {
      // 23505 = unique violation (two sign-ups racing on the same email)
      if (error.code === "23505") throw new EmailTakenError();
      throw new Error(error.message);
    }
    return newUser;
  }

  writeLocalDB((db) => {
    db.users.push(newUser);
  });
  return newUser;
}

export async function updateUserPlan(userId: string, planTier: PlanTier): Promise<UserAccount | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("users")
      .update({ plan_tier: planTier })
      .eq("id", userId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromRow(data) : null;
  }

  let updated: UserAccount | null = null;
  writeLocalDB((db) => {
    const user = db.users.find((u: UserAccount) => u.id === userId);
    if (user) {
      user.planTier = planTier;
      updated = user;
    }
  });
  return updated;
}

export interface ProfileUpdate {
  fullName?: string;
  phone?: string;
  headline?: string;
  locationArea?: string;
  address?: string;
  skills?: string[];
  companyName?: string;
}

export async function updateUserProfile(userId: string, changes: ProfileUpdate): Promise<UserAccount | null> {
  const supabase = getSupabase();
  if (supabase) {
    const row: Record<string, unknown> = {};
    if (changes.fullName !== undefined) row.full_name = changes.fullName;
    if (changes.phone !== undefined) row.phone = changes.phone;
    if (changes.headline !== undefined) row.headline = changes.headline;
    if (changes.locationArea !== undefined) row.location_area = changes.locationArea;
    if (changes.address !== undefined) row.address = changes.address;
    if (changes.skills !== undefined) row.skills = changes.skills;
    if (changes.companyName !== undefined) row.company_name = changes.companyName;
    if (Object.keys(row).length === 0) return getUserById(userId);

    const { data, error } = await supabase.from("users").update(row).eq("id", userId).select("*").maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromRow(data) : null;
  }

  let updated: UserAccount | null = null;
  writeLocalDB((db) => {
    const user = db.users.find((u: UserAccount) => u.id === userId);
    if (user) {
      for (const [key, value] of Object.entries(changes)) {
        if (value !== undefined) user[key] = value;
      }
      updated = user;
    }
  });
  return updated;
}

/** Pass null values to remove the CV from the profile. */
export async function updateUserResume(userId: string, resumeUrl: string | null, fileName: string | null): Promise<UserAccount | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("users")
      .update({ resume_url: resumeUrl, resume_file_name: fileName })
      .eq("id", userId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromRow(data) : null;
  }

  let updated: UserAccount | null = null;
  writeLocalDB((db) => {
    const user = db.users.find((u: UserAccount) => u.id === userId);
    if (user) {
      user.resumeUrl = resumeUrl ?? undefined;
      user.resumeFileName = fileName ?? undefined;
      updated = user;
    }
  });
  return updated;
}

export async function getSeekerResumes(locationArea?: string, query?: string): Promise<UserAccount[]> {
  let seekers: UserAccount[];

  const supabase = getSupabase();
  if (supabase) {
    let request = supabase
      .from("users")
      .select("*")
      .eq("role", "JOB_SEEKER")
      .not("resume_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (locationArea && locationArea !== "ALL") {
      request = request.eq("location_area", locationArea);
    }
    const { data, error } = await request;
    if (error) throw new Error(error.message);
    seekers = (data || []).map(fromRow);
  } else {
    seekers = readLocalDB().users.filter((u: UserAccount) => u.role === "JOB_SEEKER" && u.resumeUrl);
    if (locationArea && locationArea !== "ALL") {
      seekers = seekers.filter((s) => s.locationArea?.toLowerCase().includes(locationArea.toLowerCase()));
    }
  }

  if (query && query.trim() !== "") {
    const q = query.toLowerCase();
    seekers = seekers.filter(
      (s) =>
        s.fullName?.toLowerCase().includes(q) ||
        s.headline?.toLowerCase().includes(q) ||
        s.skills?.some((sk) => sk.toLowerCase().includes(q))
    );
  }

  return seekers;
}
