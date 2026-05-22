import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import type { Profile } from "@/types/database";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("name, role").eq("id", user.id).single() as
    { data: Pick<Profile, "name" | "role"> | null; error: unknown };

  if (!profile || profile.role !== "super_admin") redirect("/login");

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardNav role="super_admin" userName={profile.name ?? user.email ?? "Super Admin"} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
