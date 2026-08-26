"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserRole, PlanTier } from "@/lib/db/users";

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
  resumeUrl?: string;
  resumeFileName?: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (userData: UserSession) => void;
  logout: () => void;
  upgradePlan: (newPlan: PlanTier) => Promise<boolean>;
  setResume: (resumeUrl: string, fileName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("illy_jobs_user_session");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading session:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: UserSession) => {
    setUser(userData);
    localStorage.setItem("illy_jobs_user_session", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("illy_jobs_user_session");
  };

  const upgradePlan = async (newPlan: PlanTier): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, planTier: newPlan }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        login(data.user);
        return true;
      }
    } catch (err) {
      console.error("Failed to upgrade plan:", err);
    }
    return false;
  };

  const setResume = (resumeUrl: string, fileName: string) => {
    if (!user) return;
    const updated = { ...user, resumeUrl, resumeFileName: fileName };
    login(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, upgradePlan, setResume }}>
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
