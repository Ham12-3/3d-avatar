import { cn } from "@/lib/utils";

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger"; className?: string }) {
  const tones = { neutral: "bg-[var(--canvas)] text-[var(--muted)]", success: "bg-[var(--signal-soft)] text-[var(--signal)]", warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300", danger: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.1em]", tones[tone], className)}>{children}</span>;
}
