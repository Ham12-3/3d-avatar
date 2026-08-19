import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/page-heading";
import { RevenueDashboard } from "@/components/revenue/revenue-dashboard";
import { loadRevenueData } from "@/lib/data/repository";

export const metadata: Metadata = { title: "Revenue" };
export default async function RevenuePage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const query = await searchParams; const candidate = Number(query.period); const period: 7|30|90 = candidate===7||candidate===90?candidate:30; const revenueData=await loadRevenueData();
  return <div className="mx-auto max-w-[1180px] p-5 sm:p-7 lg:p-9"><PageHeading eyebrow="Finance" title="Revenue" description="Net movement, period comparisons, refunds, and transaction-level exceptions."/><RevenueDashboard initialPeriod={period} revenueData={revenueData}/></div>;
}
