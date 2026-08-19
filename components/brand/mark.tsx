import { cn } from "@/lib/utils";

export function Mark({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  return <div className={cn("flex items-center gap-3", className)}><span className={cn("relative grid size-9 place-items-center rounded-xl border font-data text-[11px] font-semibold", inverse ? "border-white/15 bg-white/[.06] text-white" : "border-[var(--line)] bg-[var(--surface-strong)] text-[var(--ink)]")}><span className="absolute right-1 top-1 size-1 rounded-full bg-[var(--signal-bright)]"/>N</span><span className={cn("font-display text-[13px] font-semibold tracking-[.17em]", inverse ? "text-white" : "text-[var(--ink)]")}>NOVA</span></div>;
}
