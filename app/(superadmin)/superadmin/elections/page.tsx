"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { ElectionStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { Plus, Calendar, Play, Square, Trophy, Loader2, X, UserCheck } from "lucide-react";
import type { Election, Candidate, Profile } from "@/types/database";

type CandidateWithProfile = Candidate & { profiles: Profile };
type ElectionWithCandidates = Election & { candidates: CandidateWithProfile[] };

export default function SuperAdminElectionsPage() {
  const supabase = createClient();
  const [elections, setElections] = useState<ElectionWithCandidates[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [pendingCandidates, setPendingCandidates] = useState<CandidateWithProfile[]>([]);
  const [form, setForm] = useState({ title: "", description: "", position: "", location: "", max_voters: "", start_date: "", end_date: "" });

  useEffect(() => { loadElections(); }, []);

  async function loadElections() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from("elections") as any)
      .select("*, candidates(*, profiles(*))")
      .order("created_at", { ascending: false });
    setElections(data ?? []);
    setLoading(false);
  }

  async function handleStatus(id: string, status: string) {
    setStatusUpdating(id);
    const updates: Record<string, unknown> = { status };
    if (status === "announced") {
      const election = elections.find((e) => e.id === id);
      if (election) {
        const winner = [...election.candidates].filter((c) => c.status === "approved").sort((a, b) => b.vote_count - a.vote_count)[0];
        if (winner) updates.winner_id = winner.profile_id;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("elections") as any).update(updates).eq("id", id);
    await loadElections();
    setStatusUpdating(null);
  }

  async function handleCandidateStatus(candidateId: string, status: "approved" | "rejected") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("candidates") as any).update({ status }).eq("id", candidateId);
    setPendingCandidates((p) => p.map((c) => c.id === candidateId ? { ...c, status } : c));
    await loadElections();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase.from("elections") as any).insert({
      title: form.title, description: form.description || null,
      position: form.position, location: form.location,
      max_voters: form.max_voters ? parseInt(form.max_voters) : null,
      start_date: form.start_date, end_date: form.end_date,
      created_by: user!.id,
      status: new Date(form.start_date) <= new Date() ? "active" : "upcoming",
    });
    if (err) setError(err.message);
    else { setShowForm(false); await loadElections(); }
    setSaving(false);
  }

  function openPending(election: ElectionWithCandidates) {
    setPendingTab(election.id);
    setPendingCandidates(election.candidates.filter((c) => c.status === "pending"));
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Election Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All elections across the system.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(true)}><Plus size={16} /> Create Election</Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <Card className="w-full max-w-lg my-4">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Election</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            {error && <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Election Title *" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. General Election 2025" required />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Position / Seat *" value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))} placeholder="e.g. MNA Seat NA-001" required />
                <Input label="Location *" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="e.g. Bahawalpur" required />
                <Input label="Max Voters (auto-announce)" value={form.max_voters} type="number" onChange={(e) => setForm((p) => ({ ...p, max_voters: e.target.value }))} placeholder="Optional" />
                <div />
                <Input label="Start Date *" value={form.start_date} type="datetime-local" onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} required />
                <Input label="End Date *" value={form.end_date} type="datetime-local" onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" loading={saving} className="flex-1">Create</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Pending candidates modal */}
      {pendingTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pending Candidate Applications</h2>
              <button onClick={() => setPendingTab(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            {pendingCandidates.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No pending applications.</p>
            ) : (
              <div className="space-y-3">
                {pendingCandidates.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{c.profiles?.name ?? "—"}</p>
                      <p className="text-xs text-slate-400">CNIC: {c.profiles?.cnic ?? "—"} · {c.profiles?.education ?? "—"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleCandidateStatus(c.id, "approved")}>Approve</Button>
                      <Button size="sm" variant="secondary" onClick={() => handleCandidateStatus(c.id, "rejected")}>Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-blue-600" /></div>
      ) : !elections.length ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <Calendar size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-400 mb-4">No elections yet.</p>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Plus size={15} /> Create Election</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {elections.map((e) => {
            const pending = e.candidates.filter((c) => c.status === "pending").length;
            const approved = e.candidates.filter((c) => c.status === "approved").length;
            const total = e.candidates.reduce((s, c) => s + c.vote_count, 0);
            return (
              <Card key={e.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-bold text-slate-900 dark:text-white">{e.title}</h2>
                      <ElectionStatusBadge status={e.status} />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{e.position} · {e.location}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                      <span>{approved} approved candidates</span>
                      <span>{total} total votes</span>
                      {e.max_voters && <span>Max: {e.max_voters} voters</span>}
                      <span>Ends: {formatDate(e.end_date)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pending > 0 && (
                      <Button size="sm" variant="secondary" className="gap-1" onClick={() => openPending(e)}>
                        <UserCheck size={13} /> {pending} Pending
                      </Button>
                    )}
                    {e.status !== "active" && e.status !== "announced" && (
                      <button onClick={() => handleStatus(e.id, "active")} disabled={statusUpdating === e.id}
                        className="inline-flex items-center gap-1 rounded-md bg-green-100 dark:bg-green-900/30 px-2.5 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400 hover:bg-green-200 disabled:opacity-50">
                        {statusUpdating === e.id ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />} Activate
                      </button>
                    )}
                    {e.status === "active" && (
                      <button onClick={() => handleStatus(e.id, "closed")} disabled={statusUpdating === e.id}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-50">
                        {statusUpdating === e.id ? <Loader2 size={11} className="animate-spin" /> : <Square size={11} />} Close
                      </button>
                    )}
                    {(e.status === "closed") && (
                      <button onClick={() => handleStatus(e.id, "announced")} disabled={statusUpdating === e.id}
                        className="inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-200 disabled:opacity-50">
                        {statusUpdating === e.id ? <Loader2 size={11} className="animate-spin" /> : <Trophy size={11} />} Announce Winner
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
