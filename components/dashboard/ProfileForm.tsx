"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Input, Select, Button, AlertBanner } from "@/components/ui";
import ResumeUploader from "@/components/ResumeUploader";
import { LOCATIONS } from "@/lib/constants";

export default function ProfileForm() {
  const { user, login } = useAuth();
  const isSeeker = user?.role === "JOB_SEEKER";

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [address, setAddress] = useState(user?.address || "");
  const [locationArea, setLocationArea] = useState(user?.locationArea || LOCATIONS[0]);
  const [skills, setSkills] = useState((user?.skills || []).join(", "));

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSeeker
            ? {
                fullName,
                phone,
                headline,
                locationArea,
                skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
              }
            : { fullName: companyName, companyName, phone, address, locationArea }
        ),
      });
      const data = await res.json();
      if (data.success) {
        login(data.user);
        setNotice({ ok: true, text: "Profile saved." });
      } else {
        setNotice({ ok: false, text: data.error || "Could not save your profile." });
      }
    } catch {
      setNotice({ ok: false, text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-sm p-5 sm:p-6 shadow-sm space-y-4">
        {isSeeker ? (
          <>
            <Input label="Full name" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input
              label="Headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Mathematics teacher, B.Ed Unilorin"
              hint="One line employers see next to your name."
            />
            <Input
              label="Skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Teaching, Excel, Customer service"
              hint="Separate skills with commas."
            />
          </>
        ) : (
          <>
            <Input
              label="Company or business name"
              required
              autoComplete="organization"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Input
              label="Business address"
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 12 Unity Road, Ilorin"
            />
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="WhatsApp or phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Select label="Area in Ilorin" value={locationArea} onChange={(e) => setLocationArea(e.target.value)} options={LOCATIONS} />
        </div>

        <p className="text-sm text-slate-700">
          Email: <strong className="text-slate-900">{user.email}</strong>
        </p>

        {notice && <AlertBanner variant={notice.ok ? "success" : "error"}>{notice.text}</AlertBanner>}

        <Button type="submit" disabled={saving} className="px-5 py-2.5 text-base">
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </form>

      {isSeeker && (
        <div className="bg-white border border-slate-200 rounded-sm p-5 sm:p-6 shadow-sm">
          <ResumeUploader label="Your CV / Resume" />
          <p className="text-xs text-slate-600 mt-2">
            Your CV is stored privately. Only employers you apply to, and Pro employers searching the
            resume database, can download it.
          </p>
        </div>
      )}
    </div>
  );
}
