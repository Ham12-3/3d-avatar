import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function Metric({ label, value, detail, signal = "neutral" }: { label: string; value: string; detail: string; signal?: "up" | "down" | "neutral" }) {
  const Icon = signal === "up" ? ArrowUpRight : signal === "down" ? ArrowDownRight : Minus;
  const tone = signal === "up"
    ? "bg-[var(--signal-soft)] text-[var(--signal)]"
    : signal === "down"
      ? "bg-[var(--danger-soft)] text-[var(--danger)]"
      : "bg-[var(--canvas-deep)] text-[var(--muted)]";

  return <article className="raised-card relative min-w-0 overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
    <div className="flex items-start justify-between gap-3"><p className="eyebrow">{label}</p><span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tone}`}><Icon size={13}/></span></div>
    <p className="font-display mt-5 truncate text-[clamp(1.55rem,2.4vw,2.15rem)] font-semibold tracking-[-.06em]">{value}</p>
    <p className={`mt-2 text-[10px] font-medium ${signal === "up" ? "text-[var(--signal)]" : signal === "down" ? "text-[var(--danger)]" : "text-[var(--muted)]"}`}>{detail}</p>
  </article>;
}
