import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { ElectionStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Vote, Calendar, Trophy, UserCheck, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { Profile, Candidate, Election } from "@/types/database";
import { isCandidateProfileComplete } from "@/types/database";

type CandidateEntry = Candidate & { elections: Election };

export default async function CandidateDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: participations }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single() as unknown as Promise<{ data: Profile | null }>,
    supabase.from("candidates").select("*, elections(*)").eq("profile_id", user!.id).order("created_at", { ascending: false }) as unknown as Promise<{ data: CandidateEntry[] | null }>,
  ]);

  const profileComplete = profile ? isCandidateProfileComplete(profile) : false;
  const totalVotes = (participations ?? []).reduce((s, p) => s + p.vote_count, 0);
  const won = (participations ?? []).filter((p) => p.elections?.winner_id === user!.id).length;
  const approved = (participations ?? []).filter((p) => p.status === "approved").length;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Welcome, {profile?.name ?? user?.email} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 capitalize">Candidate Panel</p>
        {!profileComplete && (
          <div className="mt-3 flex flex-col gap-3 rounded-xl border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 px-4 py-3 sm:flex-row sm:items-start">
            <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5 hidden sm:block" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">Profile Incomplete</p>
              <p className="text-xs text-red-600 dark:text-red-400">Complete your profile (Name, Father Name, CNIC, DOB, Address, Education) to participate in elections.</p>
            </div>
            <Link href="/candidate/profile" className="sm:ml-auto flex-shrink-0">
              <Button size="sm" variant="outline" className="w-full sm:w-auto border-red-300 text-red-700 dark:border-red-600 dark:text-red-400">Update Profile</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Elections Joined", value: participations?.length ?? 0, icon: Calendar, color: "blue" },
          { label: "Approved",         value: approved,                      icon: UserCheck, color: "green" },
          { label: "Total Votes",      value: totalVotes,                    icon: Vote,      color: "purple" },
          { label: "Elections Won",    value: won,                           icon: Trophy,    color: "amber" },
        ].map((s) => {
          const Icon = s.icon;
          const colors: Record<string, string> = {
            blue:  "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            purple:"bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
            amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
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
          <h2 className="font-bold text-slate-900 dark:text-white">My Election Participations</h2>
          <Link href="/candidate/participate">
            <Button variant="ghost" size="sm" className="gap-1">Browse elections <ArrowRight size={13} /></Button>
          </Link>
        </div>
        {!participations?.length ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Calendar size={40} className="mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-400 mb-3">Not participating in any elections yet.</p>
            <Link href="/candidate/participate">
              <Button size="sm" disabled={!profileComplete}>Browse &amp; Apply</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {["Election", "Position", "Location", "Status", "Votes", "End Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {participations.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.elections?.title ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.elections?.position ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.elections?.location ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      p.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : p.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{p.vote_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{p.elections ? formatDate(p.elections.end_date) : "—"}</td>
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
