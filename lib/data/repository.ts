import { knowledgeDocuments, revenueData, supportTickets } from "@/lib/data/demo";
import type { KnowledgeDocument, RevenuePoint, SessionRecord, SupportTicket, UserPreferences } from "@/lib/domain/types";

export const databaseEnabled = () => Boolean(process.env.DATABASE_URL);

export const defaultPreferences: UserPreferences = {
  theme: "system",
  captionsEnabled: true,
  microphoneDefault: true,
  cameraDefault: false,
  screenSharePrompt: true,
};

export async function loadUserPreferences(userId: string): Promise<UserPreferences> {
  if (!databaseEnabled()) return defaultPreferences;
  const { prisma } = await import("@/lib/db/prisma");
  const preference = await prisma.userPreference.findUnique({ where: { userId } });
  if (!preference) return defaultPreferences;
  return {
    theme: preference.theme === "light" || preference.theme === "dark" ? preference.theme : "system",
    captionsEnabled: preference.captionsEnabled,
    microphoneDefault: preference.microphoneDefault,
    cameraDefault: preference.cameraDefault,
    screenSharePrompt: preference.screenSharePrompt,
  };
}

export async function loadRevenueData(): Promise<RevenuePoint[]> {
  if (!databaseEnabled()) return revenueData;
  const { prisma } = await import("@/lib/db/prisma");
  const entries = await prisma.revenueEntry.findMany({ orderBy: { occurredAt: "desc" }, take: 365, include: { refunds: true } });
  const days = new Map<string, RevenuePoint>();
  for (const entry of entries) {
    const date=entry.occurredAt.toISOString().slice(0,10); const gross=entry.grossPence/100; const refunds=entry.refunds.reduce((sum,refund)=>sum+refund.amountPence/100,0); const current=days.get(date)??{date,gross:0,refunds:0,net:0};
    current.gross+=gross; current.refunds+=refunds; current.net+=gross-refunds; days.set(date,current);
  }
  return Array.from(days.values()).sort((a,b)=>a.date.localeCompare(b.date));
}

export async function loadSupportTickets(): Promise<SupportTicket[]> {
  if (!databaseEnabled()) return supportTickets;
  const { prisma } = await import("@/lib/db/prisma");
  const tickets=await prisma.supportTicket.findMany({orderBy:{createdAt:"desc"},take:500});
  return tickets.map((ticket)=>({id:ticket.ticketNumber,title:ticket.title,description:ticket.description,status:ticket.status,priority:ticket.priority,category:ticket.category,assignedTeam:ticket.assignedTeam,assignedUser:ticket.assignedUser??"Unassigned",customer:ticket.customer,createdAt:ticket.createdAt.toISOString(),updatedAt:ticket.updatedAt.toISOString()}));
}

export async function loadKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  if (!databaseEnabled()) return knowledgeDocuments;
  const { prisma } = await import("@/lib/db/prisma");
  const documents=await prisma.knowledgeDocument.findMany({orderBy:{updatedAt:"desc"}});
  return documents.map((document)=>({id:document.id,name:document.name,type:document.type,content:document.content,status:document.status,words:Math.round(document.tokenCount/1.35),updatedAt:document.updatedAt.toISOString().slice(0,10)}));
}

export async function loadSessionRecords(): Promise<SessionRecord[]> {
  if (!databaseEnabled()) { const { sessions } = await import("@/lib/data/demo"); return sessions; }
  const { prisma } = await import("@/lib/db/prisma");
  const records=await prisma.avatarSession.findMany({orderBy:{startedAt:"desc"},take:100,include:{_count:{select:{toolExecutions:true}}}});
  return records.map((record)=>({id:record.providerConversationId??record.id,startedAt:new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/London"}).format(record.startedAt),duration:formatDuration(record.durationSeconds??Math.max(0,Math.round(((record.endedAt??new Date()).getTime()-record.startedAt.getTime())/1000))),status:record.status==="COMPLETED"?"Completed":record.status==="ACTIVE"?"Active":"Failed",tools:record._count.toolExecutions,topic:record.status==="ACTIVE"?"Active Nova conversation":"Nova conversation"}));
}

function formatDuration(seconds:number){return `${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;}
