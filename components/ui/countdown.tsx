"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownProps {
  targetDate: string;
  label?: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Countdown({ targetDate, label = "Time Remaining" }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    function tick() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft(null);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s });
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (expired) return null;
  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
      <Clock size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 animate-pulse" />
      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mr-1">{label}:</span>
      <div className="flex items-center gap-1 text-sm font-mono font-bold text-blue-700 dark:text-blue-300">
        {timeLeft.d > 0 && <><span>{timeLeft.d}d</span><span className="mx-0.5 opacity-50">:</span></>}
        <span>{pad(timeLeft.h)}h</span>
        <span className="mx-0.5 opacity-50">:</span>
        <span>{pad(timeLeft.m)}m</span>
        <span className="mx-0.5 opacity-50">:</span>
        <span>{pad(timeLeft.s)}s</span>
      </div>
    </div>
  );
}
