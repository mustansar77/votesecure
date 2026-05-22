import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { ElectionStatusBadge } from "@/components/ui/badge";
import { Trophy, BarChart2 } from "lucide-react";
import type { Election, Candidate, Profile } from "@/types/database";

type CandidateWithProfile = Candidate & { profiles: Profile };

export default async function CandidateResultsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: myParticipations } = await supabase
    .from("candidates")
    .select("*, elections(*, candidates(*, profiles(*)))")
    .eq("profile_id", user!.id) as unknown as {
      data: (Candidate & { elections: Election & { candidates: CandidateWithProfile[] } })[] | null
    };

  const elections = (myParticipations ?? []).map((p) => ({
    election: p.elections,
    myEntry: p,
    candidates: [...(p.elections?.candidates ?? [])].filter((c) => c.status === "approved").sort((a, b) => b.vote_count - a.vote_count),
  }));

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Election Results</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Results for elections you participated in.</p>
      </div>

      {!elections.length ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <BarChart2 size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-400">You haven&apos;t participated in any elections yet.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {elections.map(({ election, myEntry, candidates }) => {
            if (!election) return null;
            const total = candidates.reduce((s, c) => s + c.vote_count, 0);
            const iWon = election.winner_id === user!.id;
            const myRank = candidates.findIndex((c) => c.profile_id === user!.id) + 1;
            return (
              <Card key={election.id} className={`p-0 overflow-hidden ${iWon ? "ring-2 ring-amber-400 dark:ring-amber-600" : ""}`}>

                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      {iWon && <Trophy size={18} className="text-amber-500" />}
                      <h2 className="font-bold text-slate-900 dark:text-white">{election.title}</h2>
                    </div>
                    <p className="text-xs text-slate-400">{election.position} · {election.location} · {total} total votes</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ElectionStatusBadge status={election.status} />
                    {iWon && (
                      <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                        🏆 You Won!
                      </span>
                    )}
                    {myEntry.status === "pending" && (
                      <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">Pending Approval</span>
                    )}
                    {myRank > 0 && myEntry.status === "approved" && (
                      <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
                        Rank #{myRank}
                      </span>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      {["Rank", "Candidate", "Father Name", "CNIC", "Votes", "Share"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {candidates.map((c, i) => {
                      const pct = total ? ((c.vote_count / total) * 100).toFixed(1) : "0.0";
                      const isMe = c.profile_id === user!.id;
                      return (
                        <tr key={c.id} className={`${isMe ? "bg-blue-50 dark:bg-blue-900/10" : i === 0 ? "bg-amber-50 dark:bg-amber-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"} transition-colors`}>
                          <td className="px-4 py-3">
                            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold
                              ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                            {c.profiles?.name ?? "—"} {isMe && <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">(You)</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.profiles?.father_name ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.profiles?.cnic ?? "—"}</td>
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
