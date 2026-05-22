"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { isCandidateProfileComplete } from "@/types/database";
import { CheckCircle2, AlertCircle, User, Loader2 } from "lucide-react";
import type { Profile } from "@/types/database";

export default function CandidateProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: "", father_name: "", cnic: "", date_of_birth: "", address: "", village: "", city: "", education: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: { user } } = await supabase.auth.getUser();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: p } = await (supabase.from("profiles") as any).select("*").eq("id", user!.id).single();
      setProfile(p);
      if (p) setForm({
        name: p.name ?? "", father_name: p.father_name ?? "", cnic: p.cnic ?? "",
        date_of_birth: p.date_of_birth ?? "", address: p.address ?? "",
        village: p.village ?? "", city: p.city ?? "", education: p.education ?? "", phone: p.phone ?? "",
      });
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false); setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase.from("profiles") as any).update({
      name: form.name || null, father_name: form.father_name || null,
      cnic: form.cnic || null, date_of_birth: form.date_of_birth || null,
      address: form.address || null, village: form.village || null,
      city: form.city || null, education: form.education || null, phone: form.phone || null,
    }).eq("id", user!.id);
    if (err) setError(err.message);
    else {
      setSuccess(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: p } = await (supabase.from("profiles") as any).select("*").eq("id", user!.id).single();
      setProfile(p);
    }
    setSaving(false);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 size={32} className="animate-spin text-blue-600" /></div>;

  const complete = profile ? isCandidateProfileComplete({ ...profile, ...form } as Profile) : false;

  const required = [
    { label: "Name", ok: !!form.name },
    { label: "Father Name", ok: !!form.father_name },
    { label: "CNIC", ok: !!form.cnic },
    { label: "Date of Birth", ok: !!form.date_of_birth },
    { label: "Address", ok: !!form.address },
    { label: "Education", ok: !!form.education },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Required to participate in elections.</p>
        </div>
        <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${complete ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
          {complete ? <><CheckCircle2 size={13} /> Ready to Apply</> : <><AlertCircle size={13} /> Incomplete</>}
        </div>
      </div>

      {/* Required fields checklist */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {required.map((r) => (
          <div key={r.label} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${r.ok ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
            <CheckCircle2 size={12} className={r.ok ? "text-green-600 dark:text-green-400" : "text-slate-300 dark:text-slate-600"} />
            {r.label}
          </div>
        ))}
      </div>

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
            <User size={26} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{profile?.name ?? "—"}</p>
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Candidate</p>
          </div>
        </div>

        {success && <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400"><CheckCircle2 size={15} /> Profile saved!</div>}
        {error && <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</div>}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name *" name="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your full name" required />
            <Input label="Father Name *" name="father_name" value={form.father_name} onChange={(e) => setForm((p) => ({ ...p, father_name: e.target.value }))} placeholder="Father's name" required />
            <Input label="CNIC *" name="cnic" value={form.cnic} onChange={(e) => setForm((p) => ({ ...p, cnic: e.target.value }))} placeholder="13-digit CNIC" required />
            <Input label="Date of Birth *" name="date_of_birth" type="date" value={form.date_of_birth} onChange={(e) => setForm((p) => ({ ...p, date_of_birth: e.target.value }))} required />
            <Input label="Education *" name="education" value={form.education} onChange={(e) => setForm((p) => ({ ...p, education: e.target.value }))} placeholder="e.g. LLB, MBA" required />
            <Input label="Phone" name="phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+92 300 0000000" />
            <Input label="Village / Town" name="village" value={form.village} onChange={(e) => setForm((p) => ({ ...p, village: e.target.value }))} placeholder="Your village" />
            <Input label="City" name="city" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="Your city" />
          </div>
          <Input label="Full Address *" name="address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Complete home address" required />
          <Button type="submit" loading={saving} className="w-full" size="lg">Save Profile</Button>
        </form>
      </Card>
    </div>
  );
}
