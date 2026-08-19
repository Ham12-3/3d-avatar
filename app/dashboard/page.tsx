import Link from "next/link";
import { ArrowRight, ArrowUpRight, CircleAlert, Clock3, Headphones, MessageSquareText, Radio, ShieldCheck } from "lucide-react";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Metric } from "@/components/dashboard/metric";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { activity } from "@/lib/data/demo";
import { compareRevenue, formatCurrency, summarizeRevenue } from "@/lib/data/revenue";
import { loadRevenueData, loadSupportTickets } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = { OPEN: "Open", IN_PROGRESS: "In progress", WAITING: "Waiting", RESOLVED: "Resolved" };

export default async function DashboardPage() {
  const [revenueData, supportTickets] = await Promise.all([loadRevenueData(), loadSupportTickets()]);
  const today = summarizeRevenue(revenueData, 1);
  const seven = summarizeRevenue(revenueData, 7);
  const thirty = compareRevenue(revenueData, 30);
  const ninety = summarizeRevenue(revenueData, 90);
  const open = supportTickets.filter((ticket) => ticket.status === "OPEN").length;
  const urgent = supportTickets.filter((ticket) => ticket.priority === "URGENT" && ticket.status !== "CLOSED" && ticket.status !== "RESOLVED").length;
  const statusCounts = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED"].map((status) => ({ status, count: supportTickets.filter((ticket) => ticket.status === status).length }));
  const maxStatus = Math.max(...statusCounts.map((item) => item.count), 1);

  return <div className="mx-auto max-w-[1280px] p-4 sm:p-6 lg:p-7 2xl:p-8">
    <PageHeading
      eyebrow="Monday operating brief"
      title="Good afternoon, Alex."
      description="Revenue is ahead of the previous period. Three support conversations still need attention today."
      action={<Link href="/dashboard/revenue" className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-[var(--line)] bg-white px-4 text-[11px] font-semibold shadow-sm transition hover:-translate-y-px hover:shadow-md">View full report <ArrowUpRight size={13}/></Link>}
    />

    <section className="operations-brief relative mt-6 overflow-hidden rounded-[18px] text-white" aria-labelledby="nova-brief-title">
      <div className="grid md:grid-cols-[minmax(0,1fr)_250px] md:items-stretch">
        <div className="px-6 py-7 sm:px-8">
          <div className="flex items-center gap-2 font-data text-[8px] uppercase tracking-[.16em] text-white/55"><span className="status-dot text-[#87d7ce]"/>Current position · 12:00</div>
          <h2 id="nova-brief-title" className="font-display mt-3 max-w-2xl text-[clamp(1.55rem,3vw,2.25rem)] font-semibold leading-[1.08] tracking-[-.045em]">Revenue is up 4.8%. Three urgent tickets remain.</h2>
          <p className="mt-3 max-w-2xl text-[11px] leading-5 text-white/60 sm:text-xs sm:leading-6">The July refund is already explained. Customer support is the only area outside today’s operating target.</p>
          <dl className="mt-6 grid grid-cols-3 border-t border-white/10 pt-4 text-[9px]"><div><dt className="text-white/40">Revenue</dt><dd className="mt-1 font-data text-white">+4.8%</dd></div><div className="border-x border-white/10 px-4"><dt className="text-white/40">Urgent tickets</dt><dd className="mt-1 font-data text-white">{urgent}</dd></div><div className="pl-4"><dt className="text-white/40">Sources</dt><dd className="mt-1 font-data text-white">12 ready</dd></div></dl>
        </div>
        <div className="border-t border-white/10 bg-black/10 p-6 md:border-l md:border-t-0">
          <MessageSquareText size={19} className="text-[#87d7ce]"/>
          <p className="mt-5 font-display text-base font-semibold">Open a guided review</p>
          <p className="mt-2 text-[10px] leading-5 text-white/50">Use voice or text to open a report, filter the queue, or review a previous session.</p>
          <Link href="/dashboard/sessions" className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#dff3ef] text-[10px] font-semibold text-[var(--ink)] transition hover:bg-white">Open sessions <ArrowRight size={12}/></Link>
        </div>
      </div>
    </section>

    <section data-avatar-target="revenue-summary" aria-label="Revenue summary" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Metric label="Today" value={formatCurrency(today.revenue)} detail="On pace · 84% of target" signal="up"/>
      <Metric label="Last 7 days" value={formatCurrency(seven.revenue)} detail="+4.8% vs previous week" signal="up"/>
      <Metric label="Last 30 days" value={formatCurrency(thirty.revenue)} detail={`${thirty.percentageChange >= 0 ? "+" : ""}${thirty.percentageChange}% vs previous period`} signal={thirty.percentageChange >= 0 ? "up" : "down"}/>
      <Metric label="Last 90 days" value={formatCurrency(ninety.revenue)} detail={`${formatCurrency(ninety.refunds)} refunded`} signal="neutral"/>
    </section>

    <section className="mt-7" aria-labelledby="focus-title">
      <div className="mb-3 flex items-end justify-between gap-3"><div><p className="eyebrow">Priority order</p><h2 id="focus-title" className="font-display mt-1.5 text-lg font-semibold tracking-[-.04em]">Today’s work</h2></div><Link href="/dashboard/sessions" className="text-[10px] font-semibold text-[var(--signal)]">View session records</Link></div>
      <div className="grid gap-3 lg:grid-cols-3">
        <Link href="/dashboard/revenue" className="raised-card group grid grid-cols-[36px_minmax(0,1fr)_auto] items-start gap-4 rounded-[14px] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><span className="font-data text-[10px] text-[var(--muted)]">01</span><div><p className="text-xs font-semibold">Review the growth channels</p><p className="mt-2 text-[10px] leading-4 text-[var(--muted)]">Check which channels produced today’s increase.</p><p className="mt-4 font-data text-[8px] text-[var(--muted)]">REVENUE · 5 MIN</p></div><span className="font-data text-[9px] text-[var(--signal)]">+4.8%</span></Link>
        <Link href="/dashboard/tickets?priority=URGENT" className="raised-card group grid grid-cols-[36px_minmax(0,1fr)_auto] items-start gap-4 rounded-[14px] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><span className="font-data text-[10px] text-[var(--muted)]">02</span><div><p className="text-xs font-semibold">Reply to urgent tickets</p><p className="mt-2 text-[10px] leading-4 text-[var(--muted)]">Three customers are waiting for a response.</p><p className="mt-4 font-data text-[8px] text-[var(--muted)]">SUPPORT · 12 MIN</p></div><span className="font-data text-[9px] text-[var(--danger)]">{urgent} OPEN</span></Link>
        <Link href="/dashboard/knowledge" className="raised-card group grid grid-cols-[36px_minmax(0,1fr)_auto] items-start gap-4 rounded-[14px] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><span className="font-data text-[10px] text-[var(--muted)]">03</span><div><p className="text-xs font-semibold">Check the returns policy</p><p className="mt-2 text-[10px] leading-4 text-[var(--muted)]">Confirm the latest document is ready for use.</p><p className="mt-4 font-data text-[8px] text-[var(--muted)]">KNOWLEDGE · 3 MIN</p></div><span className="font-data text-[9px] text-[var(--accent)]">12 SOURCES</span></Link>
      </div>
    </section>

    <div className="mt-7 grid gap-5 2xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,.75fr)]">
      <section data-avatar-target="revenue-chart" className="surface overflow-hidden"><header className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-5 sm:px-6"><div><div className="flex items-center gap-2"><Radio size={12} className="text-[var(--signal)]"/><p className="eyebrow">Revenue movement</p></div><h2 className="font-display mt-2 text-xl font-semibold tracking-[-.04em]">Net revenue</h2></div><div className="rounded-full bg-[var(--signal-wash)] px-3 py-1.5 font-data text-[8px] text-[var(--signal)]">30 DAYS · GBP</div></header><div className="px-3 pb-2 pt-5 sm:px-5"><RevenueChart compact data={revenueData.slice(-30)}/></div><div className="mx-5 mb-5 flex items-start gap-3 rounded-2xl bg-[var(--warning-soft)] px-4 py-3 text-[10px] leading-5 text-[var(--warning)] sm:mx-6"><CircleAlert size={14} className="mt-0.5 shrink-0"/><span><strong>One explainable exception.</strong> A £4,380 refund caused the visible dip on 18 July.</span></div></section>

      <section data-avatar-target="support-summary" className="surface overflow-hidden"><header className="border-b border-[var(--line)] p-5"><div className="flex items-center justify-between"><div><p className="eyebrow">Support pressure</p><h2 className="font-display mt-2 text-lg font-semibold tracking-[-.04em]">Queue health</h2></div><div className="grid size-10 place-items-center rounded-2xl bg-[var(--danger-soft)] text-[var(--danger)]"><Headphones size={17}/></div></div><div className="mt-5 flex items-end justify-between"><div><span className="font-display text-4xl font-semibold tracking-[-.06em]">{open}</span><p className="mt-1 text-[10px] text-[var(--muted)]">Open tickets</p></div><div className="rounded-2xl bg-[var(--danger-soft)] px-3 py-2 text-right"><span className="font-data text-lg font-semibold text-[var(--danger)]">{urgent}</span><p className="text-[8px] text-[var(--danger)]">urgent</p></div></div></header><div className="space-y-4 px-5 py-5">{statusCounts.map((item) => <div key={item.status}><div className="mb-1.5 flex items-center justify-between text-[10px]"><span className="text-[var(--muted)]">{statusLabels[item.status]}</span><span className="font-data font-medium">{item.count}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[var(--canvas)]"><div className={`h-full rounded-full ${item.status === "OPEN" ? "bg-[var(--danger)]" : item.status === "RESOLVED" ? "bg-[var(--signal)]" : "bg-[var(--line-strong)]"}`} style={{ width: `${Math.max(8, (item.count / maxStatus) * 100)}%` }}/></div></div>)}</div><Link href="/dashboard/tickets" className="flex items-center justify-between border-t border-[var(--line)] px-5 py-4 text-xs font-semibold text-[var(--signal)] transition hover:bg-[var(--signal-wash)]">Open support queue <ArrowRight size={14}/></Link></section>
    </div>

    <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,.9fr)]">
      <section data-avatar-target="recent-activity" className="surface overflow-hidden"><header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-5 sm:px-6"><div><p className="eyebrow">Live signal rail</p><h2 className="font-display mt-2 text-lg font-semibold tracking-[-.04em]">What changed today</h2></div><div className="flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1.5 font-data text-[8px] text-[var(--muted)]"><Clock3 size={11}/> Updated now</div></header><div className="signal-rail ml-6 py-2">{activity.map((item, index) => <div key={item.time + item.text} className="grid grid-cols-[12px_42px_minmax(0,1fr)] gap-3 py-4 pr-6"><span className={`signal-node mt-1 ${index === 0 ? "bg-[var(--danger)]" : ""}`}/><time className="font-data text-[9px] text-[var(--muted)]">{item.time}</time><div><p className="text-xs font-semibold">{item.text}</p><p className="mt-1 text-[10px] leading-5 text-[var(--muted)]">{item.meta}</p></div></div>)}</div></section>

      <section data-avatar-target="ai-session-status" className="relative overflow-hidden rounded-[16px] border border-white/8 bg-[var(--nav)] text-white shadow-[0_12px_30px_rgba(10,25,27,.14)]"><div className="relative p-6"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 font-data text-[8px] uppercase tracking-[.16em] text-[var(--signal-bright)]"><span className="status-dot"/>Conversation controls</div><h2 className="font-display mt-3 text-2xl font-semibold tracking-[-.045em]">Voice and text are available</h2></div><MessageSquareText size={19} className="text-[var(--signal-bright)]"/></div><p className="mt-4 max-w-sm text-xs leading-6 text-white/55">Open a report, filter support tickets, or change workspace settings using a spoken or typed command.</p><div className="mt-6 border-l border-white/15 pl-4"><p className="font-data text-[8px] uppercase tracking-[.14em] text-white/35">Example command</p><p className="mt-2 text-xs text-white/80">“Show revenue for the last 90 days.”</p></div></div><div className="relative grid grid-cols-2 border-t border-white/8"><div className="p-5"><p className="font-display text-2xl font-semibold">04</p><p className="mt-1 text-[9px] text-white/35">Sessions this week</p></div><div className="border-l border-white/8 p-5"><p className="font-display text-2xl font-semibold">15</p><p className="mt-1 text-[9px] text-white/35">Actions completed</p></div></div><div className="relative flex items-center gap-2 border-t border-white/8 px-5 py-3 text-[9px] text-white/35"><ShieldCheck size={11}/>Runs in this browser · no avatar usage fees</div></section>
    </div>
  </div>;
}
