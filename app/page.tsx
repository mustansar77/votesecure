import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import {
  ShieldCheck, Vote, BarChart2, Users, Lock, Zap, Globe,
  CheckCircle2, ArrowRight, UserCheck, ClipboardList, TrendingUp,
  HelpCircle,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Secure & Encrypted",
    description: "Every ballot is encrypted end-to-end. Multi-Factor Authentication (MFA) ensures only verified voters can cast their vote.",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  },
  {
    icon: Vote,
    title: "Easy Ballot Casting",
    description: "A clean, step-by-step interface guides voters through candidate selection and confirmation — no confusion, no errors.",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
  },
  {
    icon: BarChart2,
    title: "Real-Time Results",
    description: "Live vote tallying with graphical dashboards. Watch results update in real-time as votes are counted securely.",
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
  },
  {
    icon: Lock,
    title: "Voter Anonymity",
    description: "Votes are stored anonymously — no identity can be linked to a specific ballot, ensuring democratic integrity.",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
  },
  {
    icon: Globe,
    title: "Vote from Anywhere",
    description: "Internet-enabled access from smartphones, tablets, or laptops. Overseas citizens and remote voters are included.",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "99.9% uptime guarantee during elections. Ballot commits in under 2 seconds. Built for high-concurrency traffic.",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
  },
];

const steps = [
  {
    step: "01", icon: UserCheck, title: "Register with CNIC",
    description: "Create your account using your 13-digit CNIC and verify your identity with a one-time OTP sent to your mobile number.",
  },
  {
    step: "02", icon: ClipboardList, title: "Browse Elections",
    description: "View all active and upcoming elections on your dashboard. Read candidate profiles and party information before deciding.",
  },
  {
    step: "03", icon: Vote, title: "Cast Your Vote",
    description: "Select your preferred candidate and confirm your ballot. Your vote is encrypted and stored anonymously — permanently.",
  },
  {
    step: "04", icon: TrendingUp, title: "Track Results",
    description: "Watch live results on the public dashboard with interactive charts showing vote counts and percentages in real-time.",
  },
];

const stats = [
  { label: "Registered Voters", value: "10,000+" },
  { label: "Elections Conducted", value: "25+" },
  { label: "Uptime Guaranteed", value: "99.9%" },
  { label: "Vote Processing", value: "< 2s" },
];

const faqs = [
  {
    question: "Is my vote truly anonymous?",
    answer: "Yes. VoteSecure uses a two-table architecture: the votes table records only the candidate voted for with no voter identity, while a separate voter_participation table records only who has voted — never what they chose. These tables cannot be joined to reveal a voter's choice.",
  },
  {
    question: "How do I register to vote?",
    answer: "Click 'Register to Vote', enter your full name, CNIC, email, and a secure password. After submitting, a one-time verification code is sent to your email. Enter the OTP on the verification page to activate your account.",
  },
  {
    question: "Can I change my vote after casting it?",
    answer: "No. Once a ballot is submitted and confirmed, it is permanently recorded and cannot be changed or revoked. This mirrors the integrity of a physical ballot box and ensures electoral fairness.",
  },
  {
    question: "What happens if I lose my internet connection while voting?",
    answer: "If your connection drops before you click 'Confirm Vote', your ballot is not submitted. Simply reconnect and resume from the election page — your selection is still shown. If the connection drops after confirmation, the vote is safely recorded.",
  },
  {
    question: "How are election results verified for accuracy?",
    answer: "Vote counts are maintained in real-time via database triggers in Supabase — every submitted vote atomically increments the candidate's counter. Administrators and independent auditors can cross-check totals against the votes table at any time.",
  },
  {
    question: "Who can become an admin or election commissioner?",
    answer: "Admins and commissioners are appointed by the system administrator directly in the Supabase dashboard. Regular users cannot self-elevate to admin. This prevents unauthorized access to election management tools.",
  },
  {
    question: "Is my personal data stored securely?",
    answer: "Yes. Passwords are hashed by Supabase Auth (bcrypt). CNIC numbers are stored only in the profiles table which is protected by Row Level Security — users can only see their own profile. No plaintext passwords are ever stored.",
  },
  {
    question: "Can I vote from my mobile phone?",
    answer: "Absolutely. VoteSecure is built with a mobile-first responsive design. Any modern browser on Android or iOS will work perfectly — no app download required.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-900">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 px-4 py-20 text-center sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-30 dark:opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)" }} />
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <ShieldCheck size={14} /> Secure · Transparent · Accessible
          </div>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            The Future of{" "}
            <span className="text-blue-600 dark:text-blue-400">Democratic</span>{" "}
            Voting is Here
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 dark:text-slate-400 sm:text-xl">
            VoteSecure modernizes the electoral process with encrypted ballot casting, real-time results,
            and CNIC-verified identities — so every legitimate vote counts.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Register to Vote <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/results">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Live Results
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            {["End-to-end encryption", "OTP verification", "Anonymous ballots", "99.9% uptime"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-green-500" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{s.value}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 dark:bg-slate-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Platform Features</span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">Why Choose VoteSecure?</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-600 dark:text-slate-400">
              Built on five foundational pillars: security, transparency, accessibility, efficiency, and reliability.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white dark:bg-slate-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Simple Process</span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">How It Works</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-600 dark:text-slate-400">
              Four easy steps from registration to seeing your vote counted in real time.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="flex flex-col items-start">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-600 dark:bg-blue-500">
                      <Icon size={24} className="text-white" />
                    </div>
                    <span className="text-4xl font-black text-slate-100 dark:text-slate-800">{s.step}</span>
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who Uses It */}
      <section className="bg-slate-50 dark:bg-slate-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Platform Roles</span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">Who Uses VoteSecure?</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { icon: Users, title: "Voters", color: "border-blue-200 dark:border-blue-800", iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", description: "Register with your CNIC, browse candidates, and cast your secure vote from anywhere.", link: "/register", cta: "Register as Voter" },
              { icon: ShieldCheck, title: "Election Officials", color: "border-green-200 dark:border-green-800", iconBg: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400", description: "Create elections, manage candidates, and monitor real-time results and system health.", link: "/login", cta: "Official Sign In" },
            ].map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className={`rounded-xl border-2 bg-white dark:bg-slate-800 p-6 ${r.color}`}>
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${r.iconBg}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{r.title}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{r.description}</p>
                  <Link href={r.link}>
                    <Button variant="outline" size="sm" className="gap-1">{r.cta} <ArrowRight size={14} /></Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white dark:bg-slate-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Help Center</span>
            <h2 className="mt-2 flex items-center justify-center gap-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              <HelpCircle size={28} className="text-blue-600 dark:text-blue-400" />
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-600 dark:text-slate-400">
              Everything you need to know about VoteSecure. Can&apos;t find your answer? Contact support.
            </p>
          </div>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-blue-600 dark:bg-blue-700 px-4 py-16 text-center sm:px-6 lg:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #fff 0%, transparent 60%)" }} />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">Ready to Exercise Your Right?</h2>
          <p className="mb-8 text-blue-100">Join thousands of citizens already using VoteSecure. Register with your CNIC in under 2 minutes.</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="!bg-white !text-blue-600 hover:!bg-blue-50 w-full sm:w-auto">
                Register Now — It&apos;s Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="lg" className="!text-white hover:!bg-blue-500 w-full sm:w-auto">
                Already registered? Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
