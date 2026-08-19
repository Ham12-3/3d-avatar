import { z } from "zod";
import { loadKnowledgeDocuments, loadRevenueData, loadSupportTickets } from "@/lib/data/repository";
import { compareRevenue, findRevenueAnomalies, summarizeRevenue } from "@/lib/data/revenue";
import { filterTickets } from "@/lib/data/tickets";
import type { TicketPriority, TicketStatus } from "@/lib/domain/types";
import { logEvent } from "@/lib/observability/logger";

export const revenuePeriodSchema = z.object({ period: z.enum(["1d", "7d", "30d", "90d"]) });
export const dateRangeSchema = z.object({ from: z.iso.date(), to: z.iso.date() }).refine((value)=>value.from<=value.to,{message:"from must be before or equal to to"});
export const ticketIdSchema = z.object({ ticketId: z.coerce.number().int().min(1000).max(999999) });
export const ticketSearchSchema = z.object({ query: z.string().max(120).optional(), status: z.enum(["OPEN","IN_PROGRESS","WAITING","RESOLVED","CLOSED"]).optional(), priority: z.enum(["LOW","MEDIUM","HIGH","URGENT"]).optional(), team: z.string().max(60).optional(), limit: z.coerce.number().int().min(1).max(20).default(10) });
export const knowledgeSearchSchema = z.object({ query: z.string().trim().min(2).max(200), limit: z.coerce.number().int().min(1).max(5).default(3) });

const inRange = (data:Awaited<ReturnType<typeof loadRevenueData>>,from:string,to:string) => data.filter((point)=>point.date>=from&&point.date<=to);
const tool = <T extends z.ZodType, R>(name:string,schema:T,handler:(args:z.output<T>)=>R|Promise<R>) => async (input:unknown):Promise<R> => { const started=performance.now(); try { const args=schema.parse(input); const result=await handler(args); logEvent("info","avatar.tool.completed",{toolName:name,durationMs:Math.round(performance.now()-started)}); return result; } catch(error) { logEvent("error","avatar.tool.failed",{toolName:name,durationMs:Math.round(performance.now()-started),message:error instanceof Error?error.message:"Unknown error"}); throw new Error(`Tool ${name} could not complete with the supplied arguments.`); } };

export const serverToolHandlers = {
  get_revenue_summary: tool("get_revenue_summary", revenuePeriodSchema, async ({period}) => summarizeRevenue(await loadRevenueData(),Number(period.slice(0,-1)))),
  compare_revenue_periods: tool("compare_revenue_periods", revenuePeriodSchema.omit({period:true}).extend({days:z.coerce.number().int().min(1).max(45)}), async ({days}) => compareRevenue(await loadRevenueData(),days)),
  get_revenue_between_dates: tool("get_revenue_between_dates", dateRangeSchema, async ({from,to}) => {const selected=inRange(await loadRevenueData(),from,to);return{from,to,...summarizeRevenue(selected,selected.length)};}),
  get_revenue_anomalies: tool("get_revenue_anomalies", revenuePeriodSchema, async ({period}) => ({period,anomalies:findRevenueAnomalies(await loadRevenueData(),Number(period.slice(0,-1)))})),
  get_refunds_between_dates: tool("get_refunds_between_dates", dateRangeSchema, async ({from,to}) => ({from,to,refunds:inRange(await loadRevenueData(),from,to).filter((point)=>point.refunds>0).map(({date,refunds})=>({date,amount:refunds,currency:"GBP"}))})),
  get_largest_refunds: tool("get_largest_refunds", z.object({limit:z.coerce.number().int().min(1).max(10).default(5)}), async ({limit}) => (await loadRevenueData()).filter((point)=>point.refunds>0).sort((a,b)=>b.refunds-a.refunds).slice(0,limit).map(({date,refunds})=>({date,amount:refunds,currency:"GBP"}))),
  get_open_ticket_count: tool("get_open_ticket_count", z.object({team:z.string().max(60).optional()}), async ({team}) => ({status:"OPEN",team:team??"ALL",count:(await loadSupportTickets()).filter((ticket)=>ticket.status==="OPEN"&&(!team||ticket.assignedTeam.toLowerCase()===team.toLowerCase())).length})),
  get_ticket: tool("get_ticket",ticketIdSchema,async({ticketId})=>{const ticket=(await loadSupportTickets()).find((item)=>item.id===ticketId);if(!ticket)throw new Error("Ticket not found");return ticket;}),
  search_tickets: tool("search_tickets",ticketSearchSchema,async({query,status,priority,team,limit})=>({tickets:filterTickets(await loadSupportTickets(),{search:query,status:status as TicketStatus|undefined,priority:priority as TicketPriority|undefined,team}).slice(0,limit)})),
  get_ticket_statistics: tool("get_ticket_statistics",z.object({}),async()=>{const tickets=await loadSupportTickets();return{total:tickets.length,byStatus:Object.fromEntries(["OPEN","IN_PROGRESS","WAITING","RESOLVED","CLOSED"].map((status)=>[status,tickets.filter((ticket)=>ticket.status===status).length])),urgentActive:tickets.filter((ticket)=>ticket.priority==="URGENT"&&!(["CLOSED","RESOLVED"] as string[]).includes(ticket.status)).length};}),
  get_team_ticket_statistics: tool("get_team_ticket_statistics",z.object({team:z.string().trim().min(2).max(60)}),async({team})=>{const tickets=(await loadSupportTickets()).filter((ticket)=>ticket.assignedTeam.toLowerCase()===team.toLowerCase());return{team,total:tickets.length,open:tickets.filter((ticket)=>ticket.status==="OPEN").length,urgent:tickets.filter((ticket)=>ticket.priority==="URGENT").length};}),
  get_user_dashboard_summary: tool("get_user_dashboard_summary",z.object({}),async()=>{const [revenues,tickets,documents]=await Promise.all([loadRevenueData(),loadSupportTickets(),loadKnowledgeDocuments()]);return{revenue:compareRevenue(revenues,30),openTickets:tickets.filter((ticket)=>ticket.status==="OPEN").length,urgentTickets:tickets.filter((ticket)=>ticket.priority==="URGENT"&&ticket.status==="OPEN").length,knowledgeSourcesReady:documents.filter((doc)=>doc.status==="READY").length};}),
  search_company_knowledge: tool("search_company_knowledge",knowledgeSearchSchema,async({query,limit})=>{const terms=query.toLowerCase().split(/\s+/);const documents=await loadKnowledgeDocuments();return{query,results:documents.map((doc)=>({...doc,score:terms.filter((term)=>`${doc.name} ${doc.type} ${doc.content}`.toLowerCase().includes(term)).length})).filter((doc)=>doc.score>0&&doc.status==="READY").sort((a,b)=>b.score-a.score).slice(0,limit).map(({id,name,type,content,updatedAt})=>({id,name,type,excerpt:content,updatedAt}))};}),
};
