import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { ElectionStatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Calendar, BarChart2, Vote, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Profile, Election } from "@/types/database";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: elections }, { count: totalVotes }] = await Promise.all([
    supabase.from("profiles").select("name, role").eq("id", user!.id).single() as unknown as Promise<{ data: Pick<Profile, "name" | "role"> | null }>,
    supabase.from("elections").select("*").eq("created_by", user!.id).order("created_at", { ascending: false }) as unknown as Promise<{ data: Election[] | null }>,
    supabase.from("votes").select("*", { count: "exact", head: true }),
  ]);

  const active = (elections ?? []).filter((e) => e.status === "active").length;
  const announced = (elections ?? []).filter((e) => e.status === "announced").length;

  const stats = [
    { label: "Elections Posted",   value: elections?.length ?? 0, icon: Calendar, color: "blue" },
    { label: "Active Elections",   value: active,                  icon: Vote,     color: "green" },
    { label: "Results Announced",  value: announced,               icon: BarChart2,color: "amber" },
    { label: "Total Votes Cast",   value: totalVotes ?? 0,         icon: Vote,     color: "purple" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Welcome, {profile?.name}</p>
        </div>
        <Link href="/admin/elections">
          <Button className="gap-2"><Plus size={16} /> Post Election</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const colors: Record<string, string> = {
            blue:   "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            green:  "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            amber:  "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
            purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
          };
          return (
            <Card key={s.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</p>
                  <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">{s.value.toLocaleString()}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[s.color]}`}><Icon size={22} /></div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 dark:text-white">My Elections</h2>
          <Link href="/admin/elections"><Button variant="ghost" size="sm">Manage all</Button></Link>
        </div>
        {!elections?.length ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Calendar size={40} className="mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-400">No elections posted yet.</p>
            <Link href="/admin/elections" className="mt-3"><Button size="sm" className="gap-1"><Plus size={14} /> Post your first election</Button></Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {["Title", "Position", "Location", "Status", "Max Voters", "End Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {elections!.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{e.title}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{e.position}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{e.location}</td>
                  <td className="px-4 py-3"><ElectionStatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{e.max_voters?.toLocaleString() ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(e.end_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  );
}
