"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpenText, CircleGauge, LifeBuoy, Settings, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Overview", icon: CircleGauge },
  { href: "/dashboard/revenue", label: "Revenue", icon: BarChart3 },
  { href: "/dashboard/tickets", label: "Tickets", icon: LifeBuoy, count: 3 },
  { href: "/dashboard/knowledge", label: "Knowledge", icon: BookOpenText },
  { href: "/dashboard/sessions", label: "Sessions", icon: Video },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav({ variant = "top" }: { variant?: "top" | "drawer" }) {
  const pathname = usePathname();
  const drawer = variant === "drawer";

  return <nav aria-label="Dashboard navigation" className={cn("flex", drawer ? "flex-col gap-1.5 p-3" : "no-scrollbar items-center gap-1 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--canvas-deep)] p-1")}>
    {items.map((item) => {
      const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
      return <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group relative flex shrink-0 items-center gap-2.5 font-medium transition",
          drawer ? "rounded-lg px-3 py-3 text-[13px]" : "rounded-lg px-3.5 py-2 text-[11px] xl:px-4",
          active
            ? drawer
              ? "bg-white/[.1] text-white"
              : "bg-[var(--nav)] text-white"
            : drawer
              ? "text-white/55 hover:bg-white/[.06] hover:text-white"
              : "text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]",
        )}
      >
        <item.icon size={drawer ? 15 : 13} strokeWidth={1.9}/>
        <span>{item.label}</span>
        {item.count ? <span className={cn("grid size-5 place-items-center rounded-full font-data text-[8px]", active ? "bg-white text-[var(--danger)]" : "bg-[var(--danger-soft)] text-[var(--danger)]")}>+{item.count}</span> : null}
      </Link>;
    })}
  </nav>;
}
