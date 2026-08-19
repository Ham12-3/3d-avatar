import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/page-heading";
import { KnowledgeWorkspace } from "@/components/knowledge/knowledge-workspace";
import { loadKnowledgeDocuments } from "@/lib/data/repository";

export const metadata: Metadata = { title: "Knowledge" };
export const dynamic = "force-dynamic";
export default async function KnowledgePage() { const documents=await loadKnowledgeDocuments(); return <div className="mx-auto max-w-[1180px] p-5 sm:p-7 lg:p-9"><PageHeading eyebrow="Reference material" title="Knowledge library" description="Add, update, and remove the documents available during a workspace session."/><KnowledgeWorkspace initialDocuments={documents}/></div>; }
