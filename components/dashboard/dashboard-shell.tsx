"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, BookOpenText, ChevronDown, CircleGauge, LifeBuoy, Menu, Phone, Radio, Search, TrendingUp, X } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Mark } from "@/components/brand/mark";
import { AvatarAppProvider } from "@/components/avatar/avatar-provider";
import { AvatarPanel } from "@/components/avatar/avatar-panel";
import { DashboardNav } from "./nav";

const focusItems = [
  { href: "/dashboard", label: "Today’s pulse", detail: "Live", icon: CircleGauge, tone: "text-[var(--signal)]" },
  { href: "/dashboard/revenue", label: "Revenue movement", detail: "+4.8%", icon: TrendingUp, tone: "text-[var(--signal)]" },
  { href: "/dashboard/tickets?priority=URGENT", label: "Urgent support", detail: "3", icon: LifeBuoy, tone: "text-[var(--danger)]" },
  { href: "/dashboard/knowledge", label: "Knowledge library", detail: "12", icon: BookOpenText, tone: "text-[var(--accent)]" },
];

export function DashboardShell({ children, authConfigured, runwayConfigured, runwayCustomAvatar }: { children: React.ReactNode; authConfigured: boolean; runwayConfigured:boolean; runwayCustomAvatar:boolean }) {
  const [mobileAvatar, setMobileAvatar] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  return <AvatarAppProvider>
    <div className="min-h-dvh bg-[var(--frame)] sm:p-2 xl:p-3">
      <div className="grid h-dvh grid-rows-[72px_1fr] overflow-hidden bg-[var(--surface-strong)] shadow-[0_18px_50px_rgba(18,35,38,.12)] sm:h-[calc(100dvh-1rem)] sm:rounded-[18px] xl:h-[calc(100dvh-1.5rem)]">
        <header className="z-30 flex min-w-0 items-center border-b border-[var(--line)] bg-white/95 px-3 backdrop-blur-xl sm:px-5">
          <Link href="/" aria-label="Nova home" className="mr-3 shrink-0 sm:mr-6"><Mark/></Link>
          <div className="hidden min-w-0 flex-1 justify-center lg:flex"><DashboardNav/></div>
          <button className="ml-auto grid size-10 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--canvas)] lg:hidden" onClick={() => setMobileNav((value) => !value)} aria-label="Toggle navigation" aria-expanded={mobileNav} aria-controls="mobile-dashboard-navigation">{mobileNav ? <X size={19}/> : <Menu size={19}/>}</button>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-5">
            <div className="hidden items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-data text-[8px] uppercase tracking-[.1em] text-[var(--muted)] xl:flex"><Radio size={10} className="text-[var(--signal)]"/>Live · 12:00</div>
            <button className="relative grid size-9 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--canvas)] hover:text-[var(--ink)]" aria-label="Notifications"><Bell size={17}/><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[var(--danger)] ring-2 ring-white"/></button>
            <button onClick={() => setMobileAvatar(true)} className="flex h-9 items-center gap-2 rounded-full bg-[var(--nav)] px-3.5 text-[11px] font-semibold text-white shadow-sm xl:hidden" aria-expanded={mobileAvatar} aria-controls="mobile-nova-panel"><Phone size={13}/> Nova</button>
            {authConfigured ? <UserButton/> : <div className="flex h-9 items-center gap-2 rounded-full border border-[var(--line)] bg-white p-1 pr-2.5" title="Demo user"><span className="grid size-7 place-items-center rounded-full bg-[var(--signal-soft)] text-[9px] font-semibold text-[var(--signal)]">AM</span><ChevronDown size={12} className="hidden text-[var(--muted)] sm:block"/></div>}
          </div>
        </header>

        <div className="relative grid min-h-0 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[210px_minmax(0,1fr)_360px]">
          <aside className="hidden min-h-0 flex-col border-r border-[var(--line)] bg-[var(--surface-strong)] lg:flex xl:hidden 2xl:flex">
            <div className="p-4 pb-2">
              <button className="flex h-10 w-full items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--canvas-deep)] px-3 text-left text-[10px] text-[var(--muted)] transition hover:border-[var(--line-strong)]" aria-label="Quick find"><Search size={13}/>Quick find <span className="ml-auto rounded-md border border-[var(--line)] bg-white px-1.5 py-0.5 font-data text-[8px]">CTRL K</span></button>
            </div>
            <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-4">
              <div className="flex items-center justify-between px-2"><p className="eyebrow">Operational focus</p><ChevronDown size={13} className="text-[var(--muted)]"/></div>
              <div className="mt-3 space-y-1">
                {focusItems.map((item, index) => <Link key={item.href} href={item.href} className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-[var(--canvas)] ${index === 0 ? "bg-[var(--accent-soft)]" : ""}`}><span className={`grid size-8 place-items-center rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] ${item.tone}`}><item.icon size={14}/></span><span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{item.label}</span><span className={`font-data text-[8px] ${item.tone}`}>{item.detail}</span></Link>)}
              </div>
              <div className="mt-6 border-t border-[var(--line)] pt-5">
                <p className="px-2 eyebrow">Workspace</p>
                <div className="mt-3 space-y-3 px-2 text-[10px] text-[var(--muted)]"><div className="flex items-center justify-between"><span>London region</span><strong className="font-data font-medium text-[var(--ink)]">GBP</strong></div><div className="flex items-center justify-between"><span>Knowledge sources</span><strong className="font-data font-medium text-[var(--ink)]">12</strong></div><div className="flex items-center justify-between"><span>Automations</span><strong className="font-data font-medium text-[var(--ink)]">08</strong></div></div>
              </div>
            </div>
            <div className="p-3"><div className="rounded-[14px] border border-[var(--line)] bg-[var(--canvas)] p-4"><div className="flex items-center justify-between"><span className="font-data text-[8px] uppercase tracking-[.14em] text-[var(--muted)]">Northstar</span><span className="status-dot text-[var(--signal)]"/></div><p className="mt-3 text-xs font-semibold">Systems normal</p><p className="mt-1 text-[9px] leading-4 text-[var(--muted)]">Data sources last checked at 12:00.</p></div></div>
          </aside>

          <main className="app-workspace scrollbar-thin min-h-0 overflow-y-auto">{children}</main>
          <div className="hidden min-h-0 bg-[var(--canvas)] p-3 xl:block"><AvatarPanel runwayConfigured={runwayConfigured} runwayCustomAvatar={runwayCustomAvatar}/></div>

          {mobileNav ? <div id="mobile-dashboard-navigation" className="absolute inset-x-3 top-3 z-20 overflow-hidden rounded-[22px] border border-white/10 bg-[var(--nav)] shadow-2xl lg:hidden"><DashboardNav variant="drawer"/><div className="border-t border-white/8 px-4 py-3 text-[9px] text-white/40">Northstar Operations · London</div></div> : null}
        </div>
      </div>

      {mobileAvatar ? <div id="mobile-nova-panel" role="dialog" aria-modal="true" aria-label="Nova conversation" className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm sm:p-3 xl:hidden"><div className="relative ml-auto h-full w-full overflow-hidden bg-[var(--surface-strong)] sm:max-w-[420px] sm:rounded-[26px]"><button onClick={() => setMobileAvatar(false)} className="absolute right-3 top-3 z-50 grid size-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur" aria-label="Close Nova"><X size={18}/></button><AvatarPanel runwayConfigured={runwayConfigured} runwayCustomAvatar={runwayCustomAvatar}/></div></div> : null}
    </div>
  </AvatarAppProvider>;
}
