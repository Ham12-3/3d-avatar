import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/page-heading";
import { SessionHistory } from "@/components/sessions/session-history";
import { Badge } from "@/components/ui/badge";
import { loadSessionRecords } from "@/lib/data/repository";

export const metadata:Metadata={title:"Sessions"};
export const dynamic="force-dynamic";

export default async function SessionsPage(){
  const sessions=await loadSessionRecords();
  return <div className="mx-auto max-w-[1180px] p-5 sm:p-7 lg:p-9"><PageHeading eyebrow="Conversation records" title="Session history" description="Review local conversation references, duration, tool activity, and completion state."/><SessionHistory sessions={sessions}/><div className="mt-5 grid gap-5 md:grid-cols-2"><section className="surface p-5"><p className="eyebrow">Stored metadata</p><h2 className="mt-2 text-sm font-semibold">Local session records</h2><p className="mt-3 text-xs leading-5 text-[var(--muted)]">Records contain session IDs, timestamps, status, transcripts, and redacted tool executions. No third-party avatar transcript is fetched.</p></section><section className="surface p-5"><p className="eyebrow">Retention</p><h2 className="mt-2 text-sm font-semibold">30-day window</h2><p className="mt-3 text-xs leading-5 text-[var(--muted)]">Conversation and tool metadata follow the workspace retention policy.</p><Badge className="mt-4">Admin managed</Badge></section></div></div>;
}
