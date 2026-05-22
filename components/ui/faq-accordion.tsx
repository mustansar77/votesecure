"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 bg-white dark:bg-slate-800 px-6 py-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.question}</span>
            <ChevronDown
              size={18}
              className={cn(
                "flex-shrink-0 text-slate-500 dark:text-slate-400 transition-transform duration-300",
                open === i && "rotate-180"
              )}
            />
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              open === i ? "max-h-96" : "max-h-0"
            )}
          >
            <p className="bg-slate-50 dark:bg-slate-900 px-6 py-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
