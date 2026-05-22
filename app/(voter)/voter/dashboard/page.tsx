import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { ElectionStatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Vote, Calendar, CheckCircle2, Clock, BarChart2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Profile, Election, VoterParticipation } from "@/types/database";
import { isVoterProfileComplete } from "@/types/database";
import { ResultsBarChart } from "@/components/charts/results-chart";

export default async function VoterDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: elections }, { data: participated }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single() as unknown as Promise<{ data: Profile | null }>,
    supabase.from("elections").select("*").order("start_date", { ascending: false }).limit(10) as unknown as Promise<{ data: Election[] | null }>,
    supabase.from("voter_participation").select("*").eq("voter_id", user!.id) as unknown as Promise<{ data: VoterParticipation[] | null }>,
  ]);

  const votedIds = new Set((participated ?? []).map((p) => p.election_id));
  const activeElections = (elections ?? []).filter((e) => e.status === "active");
  const upcomingElections = (elections ?? []).filter((e) => e.status === "upcoming");
  const profileComplete = profile ? isVoterProfileComplete(profile) : false;

  const stats = [
    { label: "Total Elections",    value: elections?.length ?? 0,      icon: Calendar,     color: "blue" },
    { label: "Votes Cast",         value: participated?.length ?? 0,    icon: Vote,         color: "green" },
    { label: "Active Elections",   value: activeElections.length,       icon: TrendingUp,   color: "orange" },
    { label: "Upcoming Elections", value: upcomingElections.length,     icon: Clock,        color: "purple" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Welcome, {profile?.name ?? user?.email} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {new Date().toLocaleDateString("en-PK", { dateStyle: "full" })}
        </p>
        {!profileComplete && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 px-4 py-3">
            <span className="text-sm text-amber-700 dark:text-amber-400">
              Your profile is incomplete. Complete it to unlock voting.
            </span>
            <Link href="/voter/profile">
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-400">
                Complete Profile
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const colors: Record<string, string> = {
            blue:   "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            green:  "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
            purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
          };
          return (
            <Card key={s.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</p>
                  <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[s.color]}`}>
                  <Icon size={22} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 size={18} className="text-blue-600 dark:text-blue-400" /> Election Status Overview
          </h2>
          {elections?.length ? (
            <ResultsBarChart candidates={(elections ?? []).map((e) => ({
              id: e.id, name: e.title, vote_count: 0,
              election_id: e.id, profile_id: "", status: "approved" as const,
              vote_count_display: e.status, created_at: e.created_at,
            }))} />
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">No elections data yet</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Vote size={18} className="text-green-600 dark:text-green-400" /> My Voting Activity
          </h2>
          <div className="space-y-3">
            {participated?.length ? participated.map((p) => (
              <div key={p.election_id} className="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Vote cast</span>
                </div>
                <span className="text-xs text-slate-400">{formatDate(p.voted_at)}</span>
              </div>
            )) : (
              <div className="flex flex-col items-center py-8 text-center">
                <Vote size={32} className="mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-400">No votes cast yet</p>
                <Link href="/voter/vote" className="mt-3">
                  <Button size="sm">Vote Now</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Active elections */}
      {activeElections.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Active Elections — Vote Now</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <tr>
                  {["Election", "Position", "Location", "Closes", "Status", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {activeElections.map((e) => {
                  const hasVoted = votedIds.has(e.id);
                  return (
                    <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{e.title}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{e.position}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{e.location}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{formatDate(e.end_date)}</td>
                      <td className="px-4 py-3"><ElectionStatusBadge status={e.status} /></td>
                      <td className="px-4 py-3">
                        {hasVoted ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                            <CheckCircle2 size={13} /> Voted
                          </span>
                        ) : profileComplete ? (
                          <Link href="/voter/vote">
                            <Button size="sm">Vote Now</Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-amber-600 dark:text-amber-400">Complete profile first</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
