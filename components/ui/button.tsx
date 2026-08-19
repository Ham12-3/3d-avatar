import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "icon" };

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  const variants = {
    primary: "bg-[var(--ink)] text-[var(--surface)] shadow-sm hover:-translate-y-px hover:shadow-md",
    secondary: "border border-[var(--line)] bg-[var(--surface-strong)] text-[var(--ink)] shadow-sm hover:-translate-y-px hover:border-[var(--line-strong)]",
    ghost: "text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]",
    danger: "bg-[var(--danger)] text-white shadow-sm hover:-translate-y-px hover:shadow-md",
  };
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", icon: "h-9 w-9" };
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-xl font-medium transition duration-200 active:translate-y-0 disabled:pointer-events-none disabled:opacity-45", variants[variant], sizes[size], className)} {...props} />;
}
