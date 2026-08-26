"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Mail, Lock, Phone, User, Building, MapPin } from "lucide-react";
import { Input, Select, Button, AlertBanner } from "@/components/ui";
import ResumeUploader from "@/components/ResumeUploader";

const LOCATIONS = [
  "Tanke / Unilorin Axis",
  "GRA",
  "Taiwo / Post Office",
  "Challenge / Unity",
  "Fate / Airport Road",
  "Asa Dam / Sawmill",
  "Sango / Kulende",
  "Ganmo / Kilanko",
  "Oke-Oyi",
  "Kwara Poly / Elekoyangan",
  "Offa Garage",
];

interface RoleToggleProps {
  value: "JOB_SEEKER" | "EMPLOYER";
  onChange: (v: "JOB_SEEKER" | "EMPLOYER") => void;
}

function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div className="bg-slate-200 p-1 rounded-sm grid grid-cols-2 text-sm font-semibold">
      {(["JOB_SEEKER", "EMPLOYER"] as const).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`py-2 rounded-sm transition-colors ${
            value === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {r === "JOB_SEEKER" ? "Job Seeker Account" : "Employer Account"}
        </button>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<"JOB_SEEKER" | "EMPLOYER">("JOB_SEEKER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [locationArea, setLocationArea] = useState(LOCATIONS[0]);
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          fullName: role === "JOB_SEEKER" ? fullName : companyName,
          companyName: role === "EMPLOYER" ? companyName : undefined,
          phone,
          locationArea,
        }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        login({ ...data.user, resumeUrl: resumeUrl || undefined, resumeFileName: resumeFileName || undefined });
        router.push(role === "EMPLOYER" ? "/post-job" : "/jobs");
      } else {
        setErrorMsg(data.error || "Registration failed.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">

      <div className="text-center space-y-1">
        <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
          Create Account on Illy<span className="text-brand-green">Jobs</span>
        </h1>
        <p className="text-sm text-slate-600">
          Join job seekers and employers across Ilorin &amp; Kwara State.
        </p>
      </div>

      <RoleToggle value={role} onChange={setRole} />

      <form onSubmit={handleRegister} className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm space-y-5">

        {errorMsg && <AlertBanner variant="error">{errorMsg}</AlertBanner>}

        {role === "JOB_SEEKER" ? (
          <Input
            label="Full Name *"
            type="text"
            required
            icon={<User className="w-5 h-5" />}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Ibrahim Abubakar"
          />
        ) : (
          <Input
            label="Company / Business Name *"
            type="text"
            required
            icon={<Building className="w-5 h-5" />}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Harmony Tech Hub"
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address *"
            type="email"
            required
            icon={<Mail className="w-5 h-5" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
          <Input
            label="WhatsApp / Phone *"
            type="tel"
            required
            icon={<Phone className="w-5 h-5" />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0803 000 0000"
          />
        </div>

        <Select
          label="Ilorin Area *"
          icon={<MapPin className="w-5 h-5" />}
          value={locationArea}
          onChange={(e) => setLocationArea(e.target.value)}
          options={LOCATIONS}
        />

        <Input
          label="Password *"
          type="password"
          required
          icon={<Lock className="w-5 h-5" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 6 characters"
        />

        {role === "JOB_SEEKER" && (
          <div className="pt-2 border-t border-slate-100">
            <ResumeUploader
              onFileSelect={(url, name) => { setResumeUrl(url); setResumeFileName(name); }}
            />
          </div>
        )}

        <Button type="submit" disabled={submitting} className="w-full py-3 text-base">
          {submitting ? "Creating Account…" : `Register as ${role === "EMPLOYER" ? "Employer" : "Job Seeker"}`}
        </Button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-bold text-slate-900 hover:underline">
            Sign In Here
          </Link>
        </p>
      </form>
    </div>
  );
}
