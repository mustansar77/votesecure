"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { Candidate } from "@/types/database";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16"];

interface ResultsChartProps {
  candidates: Candidate[];
}

export function ResultsBarChart({ candidates }: ResultsChartProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />;

  const isDark = theme === "dark";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#334155" : "#e2e8f0";

  const data = candidates.map((c) => ({ name: c.name.split(" ")[0], votes: c.vote_count, party: c.party ?? "" }));
  const total = candidates.reduce((s, c) => s + c.vote_count, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
          <YAxis tick={{ fill: textColor, fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: isDark ? "#1e293b" : "#fff", border: `1px solid ${gridColor}`, borderRadius: 8 }}
            labelStyle={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: 600 }}
            formatter={(val, _name, props) => {
              const v = Number(val);
              return [`${v.toLocaleString()} votes (${total ? ((v / total) * 100).toFixed(1) : 0}%)`, (props as { payload?: { party?: string } }).payload?.party || "Votes"];
            }}
          />
          <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-slate-400">Total votes cast: {total.toLocaleString()}</p>
    </div>
  );
}

export function ResultsPieChart({ candidates }: ResultsChartProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />;

  const isDark = theme === "dark";
  const total = candidates.reduce((s, c) => s + c.vote_count, 0);

  const data = candidates.map((c) => ({
    name: c.name,
    value: c.vote_count,
    pct: total ? ((c.vote_count / total) * 100).toFixed(1) : "0",
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} paddingAngle={2}
          label={false} labelLine={false}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: isDark ? "#1e293b" : "#fff", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, borderRadius: 8 }}
          formatter={(val, name) => [`${Number(val).toLocaleString()} votes`, name]}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: isDark ? "#94a3b8" : "#64748b" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
