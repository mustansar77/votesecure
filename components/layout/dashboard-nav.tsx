"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Vote, BarChart2, LogOut, ShieldCheck,
  Users, Calendar, User, UserCheck, Settings, Menu, X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import type { UserRole } from "@/types/database";

interface NavItem { href: string; label: string; icon: React.ElementType; }

const navByRole: Record<UserRole, NavItem[]> = {
  voter: [
    { href: "/voter/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/voter/vote",      label: "Vote",       icon: Vote },
    { href: "/voter/results",   label: "Results",    icon: BarChart2 },
    { href: "/voter/profile",   label: "My Profile", icon: User },
  ],
  candidate: [
    { href: "/candidate/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
    { href: "/candidate/participate", label: "Participate", icon: UserCheck },
    { href: "/candidate/results",     label: "Results",     icon: BarChart2 },
    { href: "/candidate/profile",     label: "My Profile",  icon: User },
  ],
  admin: [
    { href: "/admin/dashboard",  label: "Dashboard",    icon: LayoutDashboard },
    { href: "/admin/elections",  label: "Elections",    icon: Calendar },
    { href: "/admin/results",    label: "Results",      icon: BarChart2 },
    { href: "/admin/profile",    label: "My Profile",   icon: User },
  ],
  super_admin: [
    { href: "/superadmin/dashboard", label: "Dashboard",  icon: LayoutDashboard },
    { href: "/superadmin/users",     label: "Users",      icon: Users },
    { href: "/superadmin/elections", label: "Elections",  icon: Calendar },
    { href: "/superadmin/results",   label: "Results",    icon: BarChart2 },
    { href: "/superadmin/settings",  label: "Settings",   icon: Settings },
  ],
};

const roleLabels: Record<UserRole, string> = {
  voter: "Voter",
  candidate: "Candidate",
  admin: "Admin",
  super_admin: "Super Admin",
};

const roleColors: Record<UserRole, string> = {
  voter:       "text-blue-600 dark:text-blue-400",
  candidate:   "text-purple-600 dark:text-purple-400",
  admin:       "text-green-600 dark:text-green-400",
  super_admin: "text-red-600 dark:text-red-400",
};

interface DashboardNavProps { role: UserRole; userName?: string; }

export function DashboardNav({ role, userName = "User" }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const navItems = navByRole[role] ?? navByRole.voter;
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* ── DESKTOP SIDEBAR (lg+) ─────────────────────────────── */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 h-screen sticky top-0">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4 dark:border-slate-700">
          <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-blue-600 dark:text-blue-400">VoteSecure</span>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <p className={`text-xs font-bold uppercase tracking-wider ${roleColors[role]}`}>
            {roleLabels[role]}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {userName}
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                )}
              >
                <Icon size={17} /> {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-slate-200 px-2 py-3 dark:border-slate-700 space-y-1">
          <ThemeToggle className="w-full justify-start gap-3 px-3 rounded-lg h-10" />
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE NAVBAR (< lg) ─────────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-blue-600 dark:text-blue-400">VoteSecure</span>
          </div>

          {/* Right: theme + hamburger */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Dropdown menu */}
        {menuOpen && (
          <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 pb-2">
            {/* User info */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className={`text-xs font-bold uppercase tracking-wider ${roleColors[role]}`}>{roleLabels[role]}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{userName}</p>
            </div>

            {/* Nav links */}
            <nav className="px-2 pt-2 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon size={17} /> {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Sign out */}
            <div className="px-2 pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={17} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
