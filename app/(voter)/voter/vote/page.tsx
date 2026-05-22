"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ElectionStatusBadge } from "@/components/ui/badge";
import { isVoterProfileComplete } from "@/types/database";
import { CheckCircle2, Vote, User, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Profile, Election, Candidate } from "@/types/database";

type ElectionWithCandidates = Election & { candidates: (Candidate & { profiles: Profile })[] };

export default function VotePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [elections, setElections] = useState<ElectionWithCandidates[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: p }, { data: e }, { data: vp }] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("profiles") as any).select("*").eq("id", user.id).single(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("elections") as any)
          .select("*, candidates(*, profiles(*))")
          .eq("status", "active")
          .order("start_date", { ascending: false }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("voter_participation") as any).select("election_id").eq("voter_id", user.id),
      ]);

      setProfile(p);
      setElections((e ?? []).map((el: ElectionWithCandidates) => ({
        ...el,
        candidates: (el.candidates ?? []).filter((c: Candidate) => c.status === "approved"),
      })));
      setVotedIds(new Set((vp ?? []).map((v: { election_id: string }) => v.election_id)));
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVote(electionId: string, candidateId: string) {
    setError("");
    setVoting(candidateId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Insert vote (anonymous)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: voteErr } = await (supabase.from("votes") as any).insert({ election_id: electionId, candidate_id: candidateId });
    if (voteErr) { setError("Failed to cast vote. Please try again."); setVoting(null); return; }

    // Record participation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("voter_participation") as any).insert({ voter_id: user.id, election_id: electionId });

    setVotedIds((prev) => new Set([...prev, electionId]));
    setSuccessId(electionId);
    setVoting(null);
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 size={32} className="animate-spin text-blue-600" />
    </div>
  );

  const profileComplete = profile ? isVoterProfileComplete(profile) : false;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Cast Your Vote</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select your candidate for each active election.</p>
      </div>

      {/* Voter identity card */}
      {profile && (
        <Card className="mb-6 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <User size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
              <div><span className="text-xs text-slate-400">Name</span><p className="font-semibold text-slate-800 dark:text-slate-200">{profile.name ?? "—"}</p></div>
              <div><span className="text-xs text-slate-400">Father Name</span><p className="font-semibold text-slate-800 dark:text-slate-200">{profile.father_name ?? "—"}</p></div>
              <div><span className="text-xs text-slate-400">CNIC</span><p className="font-semibold text-slate-800 dark:text-slate-200">{profile.cnic ?? "—"}</p></div>
              <div><span className="text-xs text-slate-400">Village</span><p className="font-semibold text-slate-800 dark:text-slate-200">{profile.village ?? "—"}</p></div>
              <div><span className="text-xs text-slate-400">Address</span><p className="font-semibold text-slate-800 dark:text-slate-200">{profile.address ?? "—"}</p></div>
              <div><span className="text-xs text-slate-400">City</span><p className="font-semibold text-slate-800 dark:text-slate-200">{profile.city ?? "—"}</p></div>
            </div>
          </div>
        </Card>
      )}

      {/* Profile incomplete warning */}
      {!profileComplete && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-5 py-4">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">Profile Incomplete — Voting Disabled</p>
            <p className="mt-0.5 text-sm text-red-600 dark:text-red-400">
              Please go to My Profile and fill in your Name, Father Name, CNIC, Date of Birth, and Address before you can vote.
            </p>
            <Link href="/voter/profile" className="mt-2 inline-block">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">Go to My Profile</Button>
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {elections.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <Vote size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="mb-2 font-semibold text-slate-700 dark:text-slate-300">No Active Elections</h3>
          <p className="text-sm text-slate-400">Check back when an election is active to cast your vote.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {elections.map((election) => {
            const hasVoted = votedIds.has(election.id);
            const isSuccess = successId === election.id;
            return (
              <Card key={election.id} className={isSuccess ? "border-green-300 dark:border-green-700" : ""}>
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{election.title}</h2>
                      <ElectionStatusBadge status={election.status} />
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>Position: <strong>{election.position}</strong></span>
                      <span>Location: <strong>{election.location}</strong></span>
                      {election.max_voters && <span>Max Voters: <strong>{election.max_voters}</strong></span>}
                    </div>
                  </div>
                  {hasVoted && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-1.5 text-sm font-semibold text-green-700 dark:text-green-400">
                      <CheckCircle2 size={15} /> Vote Submitted
                    </div>
                  )}
                </div>

                {election.candidates.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No approved candidates yet.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {election.candidates.map((candidate) => (
                      <div key={candidate.id}
                        className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm">
                          {candidate.profiles?.name?.[0] ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white">{candidate.profiles?.name ?? "Unknown"}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Father: {candidate.profiles?.father_name ?? "—"}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">CNIC: {candidate.profiles?.cnic ?? "—"}</p>
                          {candidate.profiles?.city && <p className="text-xs text-slate-500 dark:text-slate-400">From: {candidate.profiles.city}</p>}
                        </div>
                        <Button
                          size="sm"
                          disabled={!profileComplete || hasVoted || voting === candidate.id}
                          onClick={() => handleVote(election.id, candidate.id)}
                          className="flex-shrink-0"
                        >
                          {voting === candidate.id ? <Loader2 size={14} className="animate-spin" /> : "Vote"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
