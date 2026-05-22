"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

interface ApplyButtonProps {
  electionId: string;
  profileId: string;
  profileComplete: boolean;
  appStatus: string | undefined;
}

export function ApplyButton({ electionId, profileId, profileComplete, appStatus }: ApplyButtonProps) {
  const supabase = createClient();
  const [status, setStatus] = useState(appStatus);
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("candidates") as any).insert({
      election_id: electionId,
      profile_id: profileId,
      status: "pending",
    });
    if (!error) setStatus("pending");
    setLoading(false);
  }

  if (status === "approved") return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 px-3 py-2 text-sm font-semibold text-green-700 dark:text-green-400">
      <CheckCircle2 size={15} /> Approved
    </span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 px-3 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
      Application Pending
    </span>
  );
  if (status === "rejected") return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-400">
      Application Rejected
    </span>
  );

  return (
    <Button disabled={!profileComplete || loading} onClick={handleApply} className="gap-2">
      {loading ? <Loader2 size={15} className="animate-spin" /> : null}
      Apply as Candidate
    </Button>
  );
}
