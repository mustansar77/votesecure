import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { ElectionStatusBadge } from "@/components/ui/badge";
import { Trophy, BarChart2 } from "lucide-react";
import type { Election, Candidate, Profile } from "@/types/database";

type CandidateWithProfile = Candidate & { profiles: Profile };

export default async function AdminResultsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: elections } = await supabase
    .from("elections")
    .select("*, candidates(*, profiles(*))")
    .eq("created_by", user!.id)
    .order("created_at", { ascending: false }) as unknown as { data: (Election & { candidates: CandidateWithProfile[] })[] | null };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Election Results</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Live and final results for your elections.</p>
      </div>

      {!elections?.length ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <BarChart2 size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400">No elections found.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {elections.map((election) => {
            const candidates = [...(election.candidates ?? [])].filter((c) => c.status === "approved").sort((a, b) => b.vote_count - a.vote_count);
            const total = candidates.reduce((s, c) => s + c.vote_count, 0);
            const winnerCandidate = election.winner_id ? candidates.find((c) => c.profile_id === election.winner_id) : null;
            const winnerProfile = winnerCandidate?.profiles ?? null;
            const isAnnounced = election.status === "announced";
            return (
              <div key={election.id} className="space-y-4">
                {isAnnounced && winnerProfile && (
                  <div className="flex flex-wrap items-center gap-4 rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-5 py-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-400">
                      <Trophy size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Official Winner — {election.title}</p>
                      <p className="text-xl font-extrabold text-slate-900 dark:text-white">{winnerProfile.name}</p>
                      <div className="mt-0.5 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                        {winnerProfile.father_name && <span>S/O {winnerProfile.father_name}</span>}
                        {winnerProfile.cnic && <span>CNIC: {winnerProfile.cnic}</span>}
                        {(winnerProfile.city ?? winnerProfile.village) && <span>{winnerProfile.city ?? winnerProfile.village}</span>}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">{election.position} · {election.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                        {total ? ((winnerCandidate!.vote_count / total) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-xs text-slate-400">{winnerCandidate!.vote_count.toLocaleString()} votes</p>
                    </div>
                  </div>
                )}
              <Card className={`p-0 overflow-hidden ${isAnnounced ? "ring-2 ring-amber-300 dark:ring-amber-700" : ""}`}>
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">{election.title}</h2>
                    <p className="text-xs text-slate-400">{election.position} · {election.location} · {total} total votes</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ElectionStatusBadge status={election.status} />
                    {isAnnounced && winnerProfile && (
                      <span className="flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                        <Trophy size={11} /> {winnerProfile.name}
                      </span>
                    )}
                  </div>
                </div>
                {candidates.length === 0 ? (
                  <p className="px-6 py-8 text-center text-sm text-slate-400">No approved candidates.</p>
                ) : (
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr>
                        {["#", "Name", "Father Name", "CNIC", "Location", "Votes", "Share"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {candidates.map((c, i) => {
                        const pct = total ? ((c.vote_count / total) * 100).toFixed(1) : "0.0";
                        return (
                          <tr key={c.id} className={`${i === 0 && election.status !== "upcoming" ? "bg-amber-50 dark:bg-amber-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"} transition-colors`}>
                            <td className="px-4 py-3">
                              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold
                                ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
                                {i + 1}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{c.profiles?.name ?? "—"}</td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.profiles?.father_name ?? "—"}</td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.profiles?.cnic ?? "—"}</td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.profiles?.city ?? c.profiles?.village ?? "—"}</td>
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{c.vote_count.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-20 rounded-full bg-slate-100 dark:bg-slate-700">
                                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                )}
              </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
