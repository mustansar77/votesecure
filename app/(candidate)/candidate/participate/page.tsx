import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { ElectionStatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Calendar, AlertCircle } from "lucide-react";
import { isCandidateProfileComplete } from "@/types/database";
import type { Profile, Election, Candidate } from "@/types/database";
import { ApplyButton } from "./apply-button";

export default async function ParticipatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: elections }, { data: myApplications }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single() as unknown as Promise<{ data: Profile | null }>,
    supabase.from("elections").select("*").in("status", ["upcoming", "active"]).order("start_date", { ascending: false }) as unknown as Promise<{ data: Election[] | null }>,
    supabase.from("candidates").select("election_id, status").eq("profile_id", user!.id) as unknown as Promise<{ data: Pick<Candidate, "election_id" | "status">[] | null }>,
  ]);

  const profileComplete = profile ? isCandidateProfileComplete(profile) : false;
  const appliedMap = new Map((myApplications ?? []).map((a) => [a.election_id, a.status]));

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Participate in Elections</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Apply to run as a candidate in open elections.</p>
      </div>

      {!profileComplete && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 px-5 py-4">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">Profile Incomplete — Applications Disabled</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
              You must fill Name, Father Name, CNIC, Date of Birth, Address, and Education in your profile before applying to any election.
            </p>
          </div>
        </div>
      )}

      {!elections?.length ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <Calendar size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-400">No open elections at the moment.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {elections.map((election) => {
            const appStatus = appliedMap.get(election.id);
            return (
              <Card key={election.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-bold text-slate-900 dark:text-white">{election.title}</h2>
                      <ElectionStatusBadge status={election.status} />
                    </div>
                    {election.description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{election.description}</p>}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                      <span>Position: <strong className="text-slate-600 dark:text-slate-300">{election.position}</strong></span>
                      <span>Location: <strong className="text-slate-600 dark:text-slate-300">{election.location}</strong></span>
                      {election.max_voters && <span>Max Voters: <strong className="text-slate-600 dark:text-slate-300">{election.max_voters}</strong></span>}
                      <span>Starts: {formatDate(election.start_date)}</span>
                      <span>Ends: {formatDate(election.end_date)}</span>
                    </div>
                  </div>
                  <ApplyButton
                    electionId={election.id}
                    profileId={user!.id}
                    profileComplete={profileComplete}
                    appStatus={appStatus}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
