"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import type { UserRole, PlanTier } from "@/lib/db/users";

export interface UserSession {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  planTier: PlanTier;
  fullName?: string;
  companyName?: string;
  companyLogo?: string;
  headline?: string;
  locationArea?: string;
  address?: string;
  skills?: string[];
  isVerified?: boolean;
  /** Storage path of the CV. Download it through /api/files/resume, never directly. */
  resumeUrl?: string;
  resumeFileName?: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  /** Stores the user the server just returned (after login, register or a profile change). */
  login: (userData: UserSession) => void;
  logout: () => void;
  refresh: () => Promise<void>;
  upgradePlan: (newPlan: PlanTier) => Promise<{ ok: boolean; error?: string }>;
  /** Unread in-app messages, refreshed periodically while signed in. */
  unreadCount: number;
  refreshUnread: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const UNREAD_POLL_MS = 45000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // The session lives in an httpOnly cookie; the server is the source of truth.
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user || null);
    } catch (e) {
      console.error("Error loading session:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.removeItem("illy_jobs_user_session"); // legacy client-side session
    } catch {}
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const userId = user?.id;
  const refreshUnread = useCallback(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
    fetch("/api/messages/unread", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setUnreadCount(typeof data.count === "number" ? data.count : 0))
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    refreshUnread();
    if (!userId) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refreshUnread();
    }, UNREAD_POLL_MS);
    return () => clearInterval(timer);
  }, [userId, refreshUnread]);

  const login = (userData: UserSession) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    fetch("/api/auth/logout", { method: "POST" }).catch((e) => console.error("Logout failed:", e));
  };

  const upgradePlan = async (newPlan: PlanTier): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: "Please sign in first." };
    try {
      const res = await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: newPlan }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        login(data.user);
        return { ok: true };
      }
      return { ok: false, error: data.error };
    } catch (err) {
      console.error("Failed to upgrade plan:", err);
    }
    return { ok: false, error: "Network error. Please try again." };
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refresh, upgradePlan, unreadCount, refreshUnread }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
