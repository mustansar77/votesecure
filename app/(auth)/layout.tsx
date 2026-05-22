import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
          <ShieldCheck size={20} />
          <span>VoteSecure</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-600">
        © {new Date().getFullYear()} VoteSecure · Islamia University of Bahawalpur
      </footer>
    </div>
  );
}
