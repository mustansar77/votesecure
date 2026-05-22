import Link from "next/link";
import { ShieldCheck, ExternalLink, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
              <ShieldCheck size={20} />
              <span>VoteSecure</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              A secure, transparent online voting platform for the digital age.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How It Works</Link></li>
              <li><Link href="/results" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Live Results</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Account</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Register as Voter</Link></li>
              <li><Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sign In</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Voter Dashboard</Link></li>
            </ul>
          </div>

          {/* University */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Project Info</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>Islamia University of Bahawalpur</li>
              <li>Dept. of Software Engineering</li>
              <li>FYP — Fall 2022–2026</li>
              <li>Nayab SanaUllah (F22BSEEN1E02099)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} VoteSecure. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <a href="mailto:contact@votesecure.pk" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Mail size={16} />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
