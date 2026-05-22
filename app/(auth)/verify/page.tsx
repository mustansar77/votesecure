"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MailCheck, ArrowLeft } from "lucide-react";

function VerifyContent() {
  const params = useSearchParams();
  const email = params.get("email") ?? "your email";

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
          <MailCheck size={32} className="text-green-600 dark:text-green-400" />
        </div>

        <h1 className="mb-2 text-2xl font-extrabold text-slate-900 dark:text-white">Check Your Email</h1>
        <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">
          We&apos;ve sent a verification link to:
        </p>
        <p className="mb-6 font-semibold text-slate-800 dark:text-slate-200">{email}</p>

        <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 text-left space-y-1">
          <p className="font-medium">Next steps:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Open the email from VoteSecure</li>
            <li>Click the verification link</li>
            <li>Sign in to access your voter dashboard</li>
          </ol>
        </div>

        <div className="space-y-3">
          <Link href="/login">
            <Button className="w-full">Continue to Sign In</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1 text-slate-500">
              <ArrowLeft size={14} /> Back to Home
            </Button>
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          Didn&apos;t receive the email? Check your spam folder or contact support.
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 w-full max-w-md rounded-2xl bg-slate-100 dark:bg-slate-800" />}>
      <VerifyContent />
    </Suspense>
  );
}
