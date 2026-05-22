"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ElectionStatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Plus, Calendar, Play, Square, Loader2, X } from "lucide-react";
import type { Election } from "@/types/database";

export default function AdminElectionsPage() {
  const supabase = createClient();
  const [elections, setElections] = useState<Election[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", position: "", location: "",
    max_voters: "", start_date: "", end_date: "",
  });

  useEffect(() => { loadElections(); }, []);

  async function loadElections() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from("elections") as any)
      .select("*").eq("created_by", user!.id).order("created_at", { ascending: false });
    setElections(data ?? []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: err } = await (supabase.from("elections") as any).insert({
      title: form.title, description: form.description || null,
      position: form.position, location: form.location,
      max_voters: form.max_voters ? parseInt(form.max_voters) : null,
      start_date: form.start_date, end_date: form.end_date,
      created_by: user!.id,
      status: new Date(form.start_date) <= new Date() ? "active" : "upcoming",
    }).select().single();
    if (err) { setError(err.message); }
    else { setElections((p) => [data, ...p]); setShowForm(false); setForm({ title: "", description: "", position: "", location: "", max_voters: "", start_date: "", end_date: "" }); }
    setSaving(false);
  }

  async function handleStatus(id: string, status: string) {
    setStatusUpdating(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("elections") as any).update({ status }).eq("id", id);
    setElections((p) => p.map((e) => e.id === id ? { ...e, status: status as Election["status"] } : e));
    setStatusUpdating(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Manage Elections</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Post and manage your elections.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(true)}><Plus size={16} /> Post Election</Button>
      </div>

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <Card className="w-full max-w-lg my-4">
            <div className="mb-5 flex items-center justify-between">
              <CardTitle>Post New Election</CardTitle>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            {error && <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Election Title *" name="title" value={form.title} onChange={handleChange} placeholder="e.g. General Election 2025" required />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Position / Seat *" name="position" value={form.position} onChange={handleChange} placeholder="e.g. MNA Seat NA-001" required />
                <Input label="Location / Constituency *" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bahawalpur" required />
                <Input label="Max Voters (auto-announce)" name="max_voters" type="number" value={form.max_voters} onChange={handleChange} placeholder="Leave empty for no limit" />
                <div />
                <Input label="Start Date *" name="start_date" type="datetime-local" value={form.start_date} onChange={handleChange} required />
                <Input label="End Date *" name="end_date" type="datetime-local" value={form.end_date} onChange={handleChange} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea name="description" rows={3} value={form.description} onChange={handleChange}
                  placeholder="Brief description of this election..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" loading={saving} className="flex-1">Post Election</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Elections table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-blue-600" /></div>
      ) : !elections.length ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <Calendar size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 mb-4">No elections posted yet.</p>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Plus size={15} /> Post First Election</Button>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <tr>
                  {["Title", "Position", "Location", "Max Voters", "Status", "End Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {elections.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{e.title}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{e.position}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{e.location}</td>
                    <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{e.max_voters?.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3"><ElectionStatusBadge status={e.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDate(e.end_date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {e.status !== "active" && (
                          <button onClick={() => handleStatus(e.id, "active")} disabled={statusUpdating === e.id}
                            className="inline-flex items-center gap-1 rounded-md bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-400 hover:bg-green-200 disabled:opacity-50">
                            {statusUpdating === e.id ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />} Activate
                          </button>
                        )}
                        {e.status === "active" && (
                          <button onClick={() => handleStatus(e.id, "closed")} disabled={statusUpdating === e.id}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-50">
                            {statusUpdating === e.id ? <Loader2 size={10} className="animate-spin" /> : <Square size={10} />} Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
