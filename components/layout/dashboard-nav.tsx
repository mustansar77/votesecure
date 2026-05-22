"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Vote,
  BarChart2,
  LogOut,
  ShieldCheck,
  Users,
  Calendar,
  UserCheck,
  User,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const voterNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/elections", label: "Elections", icon: Calendar },
  { href: "/results", label: "Results", icon: BarChart2 },
  { href: "/profile", label: "My Profile", icon: User },
];

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/elections", label: "Elections", icon: Calendar },
  { href: "/admin/candidates", label: "Candidates", icon: UserCheck },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/results", label: "Results", icon: BarChart2 },
];

interface DashboardNavProps {
  role?: "voter" | "admin" | "commissioner";
  userName?: string;
}

export function DashboardNav({ role = "voter", userName = "User" }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = role === "voter" ? voterNav : adminNav;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4 dark:border-slate-700">
        <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400" />
        <span className="font-bold text-blue-600 dark:text-blue-400">VoteSecure</span>
      </div>

      {/* User info */}
      <div className="px-4 py-3">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {role}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
          {userName}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-0.5",
                active
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-slate-200 px-2 py-3 dark:border-slate-700">
        <ThemeToggle className="mb-2 w-full justify-start gap-3 px-3 rounded-lg h-10 !w-auto" />
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:flex h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
        <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
          <ShieldCheck size={20} />
          <span>VoteSecure</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col bg-white dark:bg-slate-900 shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}

export function DashboardVoteIcon() {
  return <Vote size={17} />;
}
