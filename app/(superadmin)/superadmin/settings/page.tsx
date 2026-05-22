"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, User, Loader2 } from "lucide-react";
import type { Profile } from "@/types/database";

export default function SuperAdminSettingsPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: "", father_name: "", cnic: "", phone: "", city: "", address: "" });
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
      if (p) setForm({ name: p.name ?? "", father_name: p.father_name ?? "", cnic: p.cnic ?? "", phone: p.phone ?? "", city: p.city ?? "", address: p.address ?? "" });
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
    const { error: err } = await (supabase.from("profiles") as any).update({ name: form.name || null, father_name: form.father_name || null, cnic: form.cnic || null, phone: form.phone || null, city: form.city || null, address: form.address || null }).eq("id", user!.id);
    if (err) setError(err.message);
    else setSuccess(true);
    setSaving(false);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 size={32} className="animate-spin text-blue-600" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your super admin profile.</p>
      </div>
      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
            <User size={26} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{profile?.name ?? "Super Admin"}</p>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">Super Admin</p>
          </div>
        </div>
        {success && <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400"><CheckCircle2 size={15} /> Settings saved!</div>}
        {error && <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" />
            <Input label="Father Name" value={form.father_name} onChange={(e) => setForm((p) => ({ ...p, father_name: e.target.value }))} placeholder="Father's name" />
            <Input label="CNIC" value={form.cnic} onChange={(e) => setForm((p) => ({ ...p, cnic: e.target.value }))} placeholder="13-digit CNIC" />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+92 300 0000000" />
            <Input label="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="Your city" />
          </div>
          <Input label="Address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Full address" />
          <Button type="submit" loading={saving} className="w-full">Save Settings</Button>
        </form>
      </Card>
    </div>
  );
}
