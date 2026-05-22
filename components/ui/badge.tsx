import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "info" | "destructive" | "default";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  destructive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  default: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ElectionStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    active: "success",
    upcoming: "info",
    closed: "default",
  };
  return <Badge variant={map[status] ?? "default"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}
