"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { formatCNIC } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({ name: "", cnic: "", phone: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === "cnic") {
      setForm((p) => ({ ...p, cnic: formatCNIC(value) }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    const cnicDigits = form.cnic.replace(/\D/g, "");
    if (cnicDigits.length !== 13) { setError("CNIC must be exactly 13 digits."); return; }

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { name: form.name, cnic: form.cnic, phone: form.phone, role: "voter" },
        },
      });

      if (signUpError) { setError(signUpError.message); return; }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) { setError(signInError.message); return; }

      router.push("/voter/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const benefits = ["CNIC-verified identity", "Encrypted ballot storage", "One vote per election", "Vote from anywhere"];

  return (
    <div className="w-full max-w-4xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:grid sm:grid-cols-2">
        {/* Left panel */}
        <div className="hidden flex-col justify-between bg-blue-600 p-8 text-white dark:bg-blue-700 sm:flex">
          <div>
            <div className="mb-6 flex items-center gap-2 text-xl font-bold">
              <ShieldCheck size={22} /> VoteSecure
            </div>
            <h2 className="mb-3 text-2xl font-extrabold leading-snug">
              Join Pakistan&apos;s Most Secure Digital Voting Platform
            </h2>
            <p className="text-sm leading-relaxed text-blue-100">
              Register once with your CNIC and participate in any election — securely, transparently, from anywhere.
            </p>
          </div>
          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-blue-100">
                <CheckCircle2 size={16} className="text-green-300 flex-shrink-0" /> {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Right panel — form */}
        <div className="p-6 sm:p-8">
          <h1 className="mb-1 text-2xl font-extrabold text-slate-900 dark:text-white">Create Account</h1>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            Already registered?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Sign in</Link>
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" name="name" placeholder="e.g. Nayab SanaUllah" value={form.name} onChange={handleChange} required />
            <Input label="CNIC Number" name="cnic" placeholder="XXXXX-XXXXXXX-X" value={form.cnic} onChange={handleChange} required hint="Your 13-digit National Identity Card number" />
            <Input label="Mobile Number" name="phone" type="tel" placeholder="03XX-XXXXXXX" value={form.phone} onChange={handleChange} required />
            <Input label="Email Address" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Input
              label="Confirm Password"
              name="confirm"
              type="password"
              placeholder="Re-enter your password"
              value={form.confirm}
              onChange={handleChange}
              required
              error={form.confirm && form.password !== form.confirm ? "Passwords don't match" : undefined}
            />

            <Button type="submit" loading={loading} className="mt-2 w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
            By registering, you confirm you are a Pakistani citizen aged 18+{" "}
            and agree to the election rules and terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
