import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/page-heading";
import { TicketWorkspace } from "@/components/tickets/ticket-workspace";
import { loadSupportTickets } from "@/lib/data/repository";

export const metadata: Metadata = { title: "Support tickets" };
export default async function TicketsPage({ searchParams }: { searchParams: Promise<{ status?: string; priority?: string; team?: string; ticket?: string }> }) {
  const query = await searchParams; const tickets=await loadSupportTickets();
  const workspaceKey=`${query.status??"ALL"}-${query.priority??"ALL"}-${query.team??"ALL"}-${query.ticket??"none"}`;
  return <div className="mx-auto max-w-[1180px] p-5 sm:p-7 lg:p-9"><PageHeading eyebrow="Customer operations" title="Support tickets" description="Triage, filter, assign, and inspect the live support queue."/><TicketWorkspace key={workspaceKey} tickets={tickets} initialStatus={query.status&&query.status!=="ALL"?query.status:undefined} initialPriority={query.priority&&query.priority!=="ALL"?query.priority:undefined} initialTeam={query.team&&query.team!=="ALL"?query.team:undefined} initialTicket={query.ticket?Number(query.ticket):undefined}/></div>;
}
