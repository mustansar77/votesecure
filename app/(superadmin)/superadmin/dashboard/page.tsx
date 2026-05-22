import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { ElectionStatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Users, Calendar, Vote, BarChart2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Election, AuthLog } from "@/types/database";

export default async function SuperAdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalVoters },
    { count: totalCandidates },
    { count: totalAdmins },
    { count: totalElections },
    { count: totalVotes },
    { data: recentElections },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "voter"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "candidate"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).in("role", ["admin", "super_admin"]),
    supabase.from("elections").select("*", { count: "exact", head: true }),
    supabase.from("votes").select("*", { count: "exact", head: true }),
    supabase.from("elections").select("*").order("created_at", { ascending: false }).limit(6) as unknown as Promise<{ data: Election[] | null }>,
    supabase.from("auth_logs").select("*").order("attempt_time", { ascending: false }).limit(8) as unknown as Promise<{ data: AuthLog[] | null }>,
  ]);

  const stats = [
    { label: "Total Users",    value: totalUsers ?? 0,     icon: Users,      color: "blue" },
    { label: "Voters",         value: totalVoters ?? 0,    icon: Vote,       color: "green" },
    { label: "Candidates",     value: totalCandidates ?? 0,icon: ShieldCheck,color: "purple" },
    { label: "Admins",         value: totalAdmins ?? 0,    icon: ShieldCheck,color: "red" },
    { label: "Elections",      value: totalElections ?? 0, icon: Calendar,   color: "orange" },
    { label: "Total Votes",    value: totalVotes ?? 0,     icon: BarChart2,  color: "teal" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Super Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Full system overview and control</p>
        </div>
        <Link href="/superadmin/users">
          <Button className="gap-2"><Users size={16} /> Manage Users</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          const colors: Record<string, string> = {
            blue:   "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            green:  "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
            red:    "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
            orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
            teal:   "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Recent Elections</h2>
            <Link href="/superadmin/elections"><Button variant="ghost" size="sm">Manage</Button></Link>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {["Title", "Status", "Location", "End Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {(recentElections ?? []).map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{e.title}</td>
                  <td className="px-4 py-3"><ElectionStatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{e.location}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(e.end_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-bold text-slate-900 dark:text-white">Recent Auth Logs</h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {["Time", "Status", "IP"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {(recentLogs ?? []).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(log.attempt_time)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${log.status.includes("Success") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{log.ip_address ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
