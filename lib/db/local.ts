import fs from "fs";
import path from "path";

/**
 * Local JSON store for development only.
 * In production the app must use Supabase: hosts such as Vercel have a
 * read-only filesystem, and data/db.json holds demo records.
 */
const DB_PATH = path.join(process.cwd(), "data", "db.json");

export interface LocalDB {
  users: any[];
  jobs: any[];
  applications: any[];
  messages: any[];
}

export const localStoreEnabled = process.env.NODE_ENV !== "production";

function normalize(raw: any): LocalDB {
  return {
    users: raw?.users || [],
    jobs: raw?.jobs || [],
    applications: raw?.applications || [],
    messages: raw?.messages || [],
  };
}

function readRaw(): any {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {
    return {};
  }
}

export function readLocalDB(): LocalDB {
  if (!localStoreEnabled) return normalize({});
  return normalize(readRaw());
}

export function writeLocalDB(update: (db: LocalDB) => void): void {
  if (!localStoreEnabled) {
    throw new Error(
      "Database is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  const raw = readRaw();
  const db = normalize(raw);
  update(db);
  fs.writeFileSync(DB_PATH, JSON.stringify({ ...raw, ...db }, null, 2), "utf-8");
}
