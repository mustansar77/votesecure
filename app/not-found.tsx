import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-900">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
            <ShieldCheck size={40} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mb-2 text-8xl font-black text-slate-100 dark:text-slate-800 select-none">404</div>
          <h1 className="mb-3 text-2xl font-extrabold text-slate-900 dark:text-white">Page Not Found</h1>
          <p className="mb-8 text-slate-500 dark:text-slate-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Please check the URL or return home.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/">
              <Button className="gap-2 w-full sm:w-auto">
                <Home size={16} /> Back to Home
              </Button>
            </Link>
            <Link href="/elections">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <ArrowLeft size={16} /> View Elections
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
