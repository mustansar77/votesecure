"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { isVoterProfileComplete } from "@/types/database";
import { CheckCircle2, AlertCircle, User, Loader2 } from "lucide-react";
import type { Profile } from "@/types/database";

export default function VoterProfilePage() {
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false); setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateErr } = await (supabase.from("profiles") as any).update({
      name: form.name || null, father_name: form.father_name || null,
      cnic: form.cnic || null, date_of_birth: form.date_of_birth || null,
      address: form.address || null, village: form.village || null,
      city: form.city || null, education: form.education || null, phone: form.phone || null,
    }).eq("id", user!.id);

    if (updateErr) { setError(updateErr.message); }
    else {
      setSuccess(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: p } = await (supabase.from("profiles") as any).select("*").eq("id", user!.id).single();
      setProfile(p);
    }
    setSaving(false);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 size={32} className="animate-spin text-blue-600" /></div>;

  const complete = profile ? isVoterProfileComplete({ ...profile, ...form as Partial<Profile> } as Profile) : false;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Keep your information up to date to vote.</p>
        </div>
        <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${complete ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
          {complete ? <><CheckCircle2 size={13} /> Complete</> : <><AlertCircle size={13} /> Incomplete</>}
        </div>
      </div>

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
            <User size={26} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{profile?.name ?? "—"}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{profile?.role}</p>
          </div>
        </div>

        {!complete && (
          <div className="mb-5 rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            Required fields: Name, Father Name, CNIC, Date of Birth, Address. Fill them to enable voting.
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 size={15} /> Profile saved successfully!
          </div>
        )}
        {error && <div className="mb-5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</div>}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name *" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
            <Input label="Father Name *" name="father_name" value={form.father_name} onChange={handleChange} placeholder="Father's full name" required />
            <Input label="CNIC *" name="cnic" value={form.cnic} onChange={handleChange} placeholder="13-digit CNIC (without dashes)" required />
            <Input label="Date of Birth *" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} required />
            <Input label="Phone Number" name="phone" value={form.phone} onChange={handleChange} placeholder="+92 300 0000000" />
            <Input label="Village / Town" name="village" value={form.village} onChange={handleChange} placeholder="Your village or town" />
            <Input label="City" name="city" value={form.city} onChange={handleChange} placeholder="Your city" />
            <Input label="Education" name="education" value={form.education} onChange={handleChange} placeholder="e.g. BS Software Engineering" />
          </div>
          <Input label="Full Address *" name="address" value={form.address} onChange={handleChange} placeholder="Complete home address" required />

          <Button type="submit" loading={saving} className="w-full" size="lg">
            Save Profile
          </Button>
        </form>
      </Card>
    </div>
  );
}
