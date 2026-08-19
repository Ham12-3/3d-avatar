"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RevenuePoint } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/data/revenue";

export function RevenueChart({ data, compact = false }: { data: RevenuePoint[]; compact?: boolean }) {
  return <div className={compact?"h-56":"h-80"}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 10, right: 8, left: compact ? -24 : -8, bottom: 0 }}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--signal)" stopOpacity={0.22}/><stop offset="100%" stopColor="var(--signal)" stopOpacity={0.01}/></linearGradient></defs><CartesianGrid stroke="var(--chart-grid)" vertical={false}/><XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={28} tick={{ fill: "var(--muted)", fontSize: 10 }} tickFormatter={(value)=>new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short"}).format(new Date(value))}/><YAxis axisLine={false} tickLine={false} width={55} tick={{ fill: "var(--muted)", fontSize: 10 }} tickFormatter={(value)=>`£${Math.round(value/1000)}k`}/><Tooltip cursor={{ stroke: "var(--line-strong)", strokeDasharray: "3 3" }} contentStyle={{ background: "var(--surface-strong)", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "var(--shadow-soft)", fontSize: 12 }} formatter={(value)=>[formatCurrency(Number(value)), "Net revenue"]}/><Area type="monotone" dataKey="net" stroke="var(--signal)" strokeWidth={2.5} fill="url(#revenueFill)" animationDuration={450}/></AreaChart></ResponsiveContainer></div>;
}
