import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getUserById, toSafeUser, type SafeUser } from "@/lib/db/users";

const COOKIE_NAME = "illy_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set to at least 32 characters in production.");
  }
  return "dev-only-session-secret-do-not-use-in-production";
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function createToken(userId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: expiresAt })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (typeof data.uid !== "string" || typeof data.exp !== "number") return null;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.uid;
  } catch {
    return null;
  }
}

export function setSessionCookie(userId: string): void {
  cookies().set(COOKIE_NAME, createToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(): void {
  cookies().delete(COOKIE_NAME);
}

/** The signed-in user, loaded fresh from the database, or null. */
export async function getSessionUser(): Promise<SafeUser | null> {
  const userId = readToken(cookies().get(COOKIE_NAME)?.value);
  if (!userId) return null;
  const user = await getUserById(userId);
  return user ? toSafeUser(user) : null;
}
