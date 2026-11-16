"use client";

import { useAuth } from "@/lib/context/AuthContext";
import SignInPrompt from "@/components/SignInPrompt";
import SeekerDashboard from "@/components/dashboard/SeekerDashboard";
import EmployerDashboard from "@/components/dashboard/EmployerDashboard";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p role="status" className="p-12 text-center text-slate-700">Loading your dashboard…</p>;
  }
  if (!user) {
    return <SignInPrompt next="/dashboard" message="Sign in to track your applications, jobs and messages." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-700 mt-1">
          Welcome back, {user.fullName || user.email}.
        </p>
      </div>
      {user.role === "JOB_SEEKER" ? <SeekerDashboard /> : <EmployerDashboard />}
    </div>
  );
}
