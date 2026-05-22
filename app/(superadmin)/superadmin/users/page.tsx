"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Loader2, X, UserPlus } from "lucide-react";
import type { Profile, UserRole } from "@/types/database";

const roleColors: Record<UserRole, string> = {
  voter:      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  candidate:  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  admin:      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  super_admin:"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const roleLabels: Record<UserRole, string> = {
  voter: "Voter", candidate: "Candidate", admin: "Admin", super_admin: "Super Admin",
};

export default function SuperAdminUsersPage() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", password: "", name: "", cnic: "", role: "voter" as UserRole });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => { loadProfiles(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(profiles.filter((p) =>
      (p.name ?? "").toLowerCase().includes(q) ||
      (p.cnic ?? "").includes(q) ||
      p.role.includes(q)
    ));
  }, [search, profiles]);

  async function loadProfiles() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from("profiles") as any).select("*").order("created_at", { ascending: false });
    setProfiles(data ?? []);
    setFiltered(data ?? []);
    setLoading(false);
  }

  async function handleRoleChange(id: string, role: UserRole) {
    setUpdatingId(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any).update({ role }).eq("id", id);
    setProfiles((p) => p.map((u) => u.id === id ? { ...u, role } : u));
    setUpdatingId(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(""); setCreating(true);
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: createForm.email,
      password: createForm.password,
      options: {
        data: { name: createForm.name, cnic: createForm.cnic, role: createForm.role },
      },
    });
    if (signUpErr) { setCreateError(signUpErr.message); setCreating(false); return; }
    if (data.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("profiles") as any).update({ role: createForm.role, name: createForm.name, cnic: createForm.cnic || data.user.id, is_verified: true }).eq("id", data.user.id);
    }
    setShowCreate(false);
    setCreateForm({ email: "", password: "", name: "", cnic: "", role: "voter" });
    await loadProfiles();
    setCreating(false);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">User Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage all users and their roles.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreate(true)}><UserPlus size={16} /> Create User</Button>
      </div>

      {/* Create user modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New User</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            {createError && <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400">{createError}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Full Name" value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" required />
              <Input label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} placeholder="user@email.com" required />
              <Input label="Password" type="password" value={createForm.password} onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))} placeholder="Min 8 characters" required />
              <Input label="CNIC" value={createForm.cnic} onChange={(e) => setCreateForm((p) => ({ ...p, cnic: e.target.value }))} placeholder="13-digit CNIC" />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                <select value={createForm.role} onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value as UserRole }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                  <option value="voter">Voter</option>
                  <option value="candidate">Candidate</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" loading={creating} className="flex-1">Create User</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, CNIC or role..."
          className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:max-w-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-blue-600" /></div>
      ) : !filtered.length ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <Users size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-400">No users found.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <tr>
                  {["Name", "CNIC", "Phone", "City", "Current Role", "Change Role"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{user.name ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{user.cnic ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{user.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{user.city ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {updatingId === user.id ? (
                        <Loader2 size={16} className="animate-spin text-blue-600" />
                      ) : (
                        <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                          <option value="voter">Voter</option>
                          <option value="candidate">Candidate</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      )}
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
