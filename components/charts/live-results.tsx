"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ResultsBarChart, ResultsPieChart } from "./results-chart";
import { Card, CardTitle } from "@/components/ui/card";
import { ElectionStatusBadge } from "@/components/ui/badge";
import { Trophy, Users, Wifi, WifiOff } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Election, Candidate } from "@/types/database";

interface LiveResultsProps {
  initialCandidates: Candidate[];
  election: Election;
}

export function LiveResults({ initialCandidates, election }: LiveResultsProps) {
  const supabase = createClient();
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  const total = candidates.reduce((s, c) => s + c.vote_count, 0);
  const winner = candidates[0];

  useEffect(() => {
    if (election.status !== "active") return;

    const channel = supabase
      .channel(`election-results-${election.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "candidates", filter: `election_id=eq.${election.id}` },
        (payload) => {
          const updated = payload.new as Candidate;
          setCandidates((prev) =>
            [...prev.map((c) => (c.id === updated.id ? updated : c))]
              .sort((a, b) => b.vote_count - a.vote_count)
          );
          setLastUpdate(new Date());
          setFlashId(updated.id);
          setTimeout(() => setFlashId(null), 1200);
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => { supabase.removeChannel(channel); };
  }, [election.id, election.status, supabase]);

  return (
    <section className="space-y-6">
      {/* Election header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{election.title}</h2>
            <ElectionStatusBadge status={election.status} />
            {election.status === "active" && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                isLive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}>
                {isLive ? <><Wifi size={12} className="animate-pulse" /> LIVE</> : <><WifiOff size={12} /> Connecting…</>}
              </span>
            )}
          </div>
          {election.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{election.description}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
            <span>Opens: {formatDate(election.start_date)}</span>
            <span>Closes: {formatDate(election.end_date)}</span>
            {lastUpdate && <span className="text-green-600 dark:text-green-400">Updated: {lastUpdate.toLocaleTimeString()}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 px-4 py-2">
          <Users size={16} className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
            {total.toLocaleString()} votes
          </span>
        </div>
      </div>

      {/* Winner banner */}
      {election.status === "closed" && winner && winner.vote_count > 0 && (
        <div className="flex items-center gap-4 rounded-xl border-2 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-5 py-4">
          <Trophy size={28} className="text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Winner</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">{winner.name}</p>
            {winner.party && <p className="text-sm text-slate-500 dark:text-slate-400">{winner.party}</p>}
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {total ? ((winner.vote_count / total) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-slate-400">{winner.vote_count.toLocaleString()} votes</p>
          </div>
        </div>
      )}

      {candidates.length === 0 ? (
        <Card className="py-10 text-center">
          <p className="text-sm text-slate-400">No candidates for this election.</p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle className="mb-5 text-base">Vote Distribution</CardTitle>
            <ResultsBarChart candidates={candidates} />
          </Card>
          <Card>
            <CardTitle className="mb-5 text-base">Vote Share</CardTitle>
            <ResultsPieChart candidates={candidates} />
          </Card>

          {/* Standings table */}
          <Card className="lg:col-span-2 p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <CardTitle>Live Standings</CardTitle>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  {["Rank", "Candidate", "Party", "Votes", "Share", "Progress"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {candidates.map((c, i) => {
                  const pct = total ? (c.vote_count / total) * 100 : 0;
                  const isFlashing = flashId === c.id;
                  return (
                    <tr key={c.id} className={`transition-all duration-500 ${
                      isFlashing ? "bg-green-50 dark:bg-green-900/20" :
                      i === 0 && election.status === "closed" ? "bg-amber-50 dark:bg-amber-900/10" :
                      "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-200" : i === 2 ? "bg-orange-300 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                        }`}>{i + 1}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.party ?? "Independent"}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {c.vote_count.toLocaleString()}
                        {isFlashing && <span className="ml-1 text-xs text-green-600 dark:text-green-400 animate-bounce">+1</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">{pct.toFixed(1)}%</td>
                      <td className="px-4 py-3 w-40">
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700">
                          <div className="h-2 rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </section>
  );
}
