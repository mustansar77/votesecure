import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import type { Profile } from "@/types/database";

export default async function VoterLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("name, role").eq("id", user.id).single() as
    { data: Pick<Profile, "name" | "role"> | null; error: unknown };

  if (!profile) redirect("/login");
  if (profile.role === "super_admin") redirect("/superadmin/dashboard");
  if (profile.role === "admin")       redirect("/admin/dashboard");
  if (profile.role === "candidate")   redirect("/candidate/dashboard");

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardNav role="voter" userName={profile.name ?? user.email ?? "Voter"} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
