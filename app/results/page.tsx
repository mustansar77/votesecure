import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { LiveResults } from "@/components/charts/live-results";
import { BarChart2 } from "lucide-react";
import type { Election, Candidate, Profile } from "@/types/database";

type CandidateWithProfile = Candidate & { profiles: Profile };

async function getResults() {
  const supabase = await createClient();
  const { data: elections } = await supabase
    .from("elections")
    .select("*")
    .in("status", ["active", "closed"])
    .order("start_date", { ascending: false }) as { data: Election[] | null; error: unknown };

  if (!elections?.length) return [];

  const results = await Promise.all(
    elections.map(async (election) => {
      const { data: candidates } = await (supabase
        .from("candidates")
        .select("*, profiles(*)")
        .eq("election_id", election.id)
        .eq("status", "approved")
        .order("vote_count", { ascending: false }) as unknown as Promise<{ data: CandidateWithProfile[] | null; error: unknown }>);
      return { election, candidates: candidates ?? [] };
    })
  );

  return results;
}

export default async function ResultsPage() {
  const results = await getResults();

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-900">
      <Navbar />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Live &amp; Final Results
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Election Results Dashboard
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-slate-500 dark:text-slate-400">
              Real-time vote tallying for all active and closed elections. Results are updated live as votes are submitted.
            </p>
          </div>

          {results.length === 0 ? (
            <Card className="flex flex-col items-center py-20 text-center">
              <BarChart2 size={56} className="mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="mb-2 text-lg font-semibold text-slate-700 dark:text-slate-300">No Results Available</h3>
              <p className="text-sm text-slate-400">Results will appear once elections are active or closed.</p>
            </Card>
          ) : (
            <div className="space-y-12">
              {results.map(({ election, candidates }) => (
                <LiveResults key={election.id} election={election} initialCandidates={candidates} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

