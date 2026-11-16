"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Mail, Lock } from "lucide-react";
import { Input, Button, AlertBanner } from "@/components/ui";
import { getNextPath } from "@/lib/navigation";

interface RoleToggleProps {
  value: "JOB_SEEKER" | "EMPLOYER";
  onChange: (v: "JOB_SEEKER" | "EMPLOYER") => void;
}

function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div role="group" aria-label="Account type" className="bg-slate-200 p-1 rounded-sm grid grid-cols-2 text-sm font-semibold">
      {(["JOB_SEEKER", "EMPLOYER"] as const).map((r) => (
        <button
          key={r}
          type="button"
          aria-pressed={value === r}
          onClick={() => onChange(r)}
          className={`py-2 rounded-sm transition-colors ${
            value === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-700 hover:text-slate-900"
          }`}
        >
          {r === "JOB_SEEKER" ? "Job Seeker" : "Ilorin Employer"}
        </button>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<"JOB_SEEKER" | "EMPLOYER">("JOB_SEEKER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        login(data.user);
        router.push(getNextPath("/dashboard"));
      } else {
        setErrorMsg(data.error || "Login failed. Please check your credentials.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">

      <div className="text-center space-y-1">
        <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
          Sign In to Illy<span className="text-brand-green">Jobs</span>
        </h1>
        <p className="text-sm text-slate-600">Access your Ilorin job seeker profile or employer portal.</p>
      </div>

      <RoleToggle value={role} onChange={setRole} />

      <form onSubmit={handleLogin} className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm space-y-5">

        {errorMsg && <AlertBanner variant="error">{errorMsg}</AlertBanner>}

        <Input
          label="Email address"
          autoComplete="email"
          type="email"
          required
          icon={<Mail className="w-5 h-5" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={role === "EMPLOYER" ? "hr@company.ng" : "ibrahim@example.com"}
        />

        <Input
          label="Password"
          autoComplete="current-password"
          type="password"
          required
          icon={<Lock className="w-5 h-5" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Button type="submit" disabled={submitting} className="w-full py-3 text-base">
          {submitting ? "Signing In…" : `Sign In as ${role === "EMPLOYER" ? "Employer" : "Candidate"}`}
        </Button>

        <p className="text-center text-sm text-slate-600">
          No account yet?{" "}
          <Link href="/auth/register" className="font-bold text-slate-900 hover:underline">
            Create Free Account
          </Link>
        </p>
      </form>
    </div>
  );
}
