import type { KnowledgeDocument, RevenuePoint, SessionDetail, SessionRecord, SupportTicket, TicketPriority, TicketStatus } from "@/lib/domain/types";

const anchor = new Date("2026-08-15T12:00:00.000Z");
const isoDay = (offset: number) => {
  const date = new Date(anchor);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

export const revenueData: RevenuePoint[] = Array.from({ length: 90 }, (_, index) => {
  const day = index - 89;
  const base = 7600 + ((index * 977) % 2200) + Math.round(Math.sin(index / 4) * 560);
  const gross = index === 61 ? 8350 : base;
  const refunds = index === 61 ? 4380 : index === 25 ? 1850 : index % 17 === 0 ? 420 : 0;
  return { date: isoDay(day), gross, refunds, net: gross - refunds };
});

const ticketSubjects = [
  "SSO redirect loop for invited users", "Exports omit refunded transactions", "Billing page loads slowly",
  "Unable to add second workspace", "Role permissions not updating", "Dashboard totals differ from export",
  "Webhook retries missing", "Mobile navigation overlaps table", "Invoice VAT number incorrect",
  "Knowledge document stuck processing", "Session transcript unavailable", "CSV date format inconsistent",
];
const teams = ["Product", "Billing", "Platform", "Customer success"];
const customers = ["Northstar Labs", "Aperture Retail", "Fieldwork", "Kite & Co", "Monument Health", "Cirrus Group"];
const statuses: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"];
const priorities: TicketPriority[] = ["MEDIUM", "HIGH", "LOW", "URGENT"];

export const supportTickets: SupportTicket[] = Array.from({ length: 42 }, (_, index) => {
  const priority = index === 0 || index === 7 || index === 19 ? "URGENT" : priorities[index % priorities.length];
  const status = index === 0 || index === 7 ? "OPEN" : statuses[(index * 3) % statuses.length];
  return {
    id: 1042 + index,
    title: ticketSubjects[index % ticketSubjects.length],
    description: `The customer reported ${ticketSubjects[index % ticketSubjects.length].toLowerCase()}. Reproduction details and browser logs are attached for investigation.`,
    status,
    priority,
    category: ["Authentication", "Reporting", "Billing", "Workspace", "Permissions"][index % 5],
    assignedTeam: teams[index % teams.length],
    assignedUser: ["Maya Chen", "Leo Martins", "Priya Shah", "Unassigned"][index % 4],
    customer: customers[index % customers.length],
    createdAt: new Date(anchor.getTime() - (index + 1) * 7.2e7).toISOString(),
    updatedAt: new Date(anchor.getTime() - index * 1.8e7).toISOString(),
  };
});

export const knowledgeDocuments: KnowledgeDocument[] = [
  { id: "kb-hr", name: "People handbook", type: "HR policy", status: "READY", words: 2840, updatedAt: "2026-08-12", content: "Annual leave is 25 days plus public holidays. Requests are made in PeopleHub with at least two weeks' notice where possible. Managers respond within three working days." },
  { id: "kb-onboarding", name: "Engineering onboarding", type: "Onboarding guide", status: "READY", words: 4120, updatedAt: "2026-08-10", content: "New engineers request a laptop through Service Desk before their start date. On day one, sign in with the temporary identity, enable MFA, install the managed device profile, then request repository access through AccessHub." },
  { id: "kb-support", name: "Critical incident playbook", type: "Support procedure", status: "READY", words: 1960, updatedAt: "2026-08-08", content: "Critical tickets are acknowledged within 15 minutes. Create an incident channel, assign an incident lead, update the public status page, and send customer updates every 30 minutes." },
  { id: "kb-product", name: "Atlas product guide", type: "Product documentation", status: "PROCESSING", words: 7310, updatedAt: "2026-08-15", content: "Product configuration and workspace administration guide." },
];

export const sessions: SessionRecord[] = [
  { id: "ses_01J5Nova8A", startedAt: "Today, 09:42", duration: "06:14", status: "Completed", tools: 5, topic: "Revenue variance review" },
  { id: "ses_01J5Nova72", startedAt: "Yesterday, 16:08", duration: "03:51", status: "Completed", tools: 3, topic: "Urgent support queue" },
  { id: "ses_01J5Nova5K", startedAt: "12 Aug, 11:20", duration: "08:02", status: "Completed", tools: 7, topic: "Weekly operations review" },
  { id: "ses_01J5Nova3P", startedAt: "11 Aug, 14:55", duration: "00:19", status: "Failed", tools: 0, topic: "Connection interrupted" },
];

export const demoSessionDetails: Record<string, SessionDetail> = {
  ses_01J5Nova8A: {
    id: "ses_01J5Nova8A", status: "Completed", recordingUrl: null, source: "demo",
    transcript: [
      { role: "user", content: "Show me what changed in revenue this month and call out anything unusual.", timestamp: "2026-08-15T08:42:08.000Z" },
      { role: "assistant", content: "Net revenue is slightly ahead of the previous period. I found one material refund that explains the sharpest daily dip.", timestamp: "2026-08-15T08:42:15.000Z" },
      { role: "user", content: "Open the largest refund and summarise the likely cause.", timestamp: "2026-08-15T08:44:02.000Z" },
      { role: "assistant", content: "The largest refund was £4,380 for an enterprise annual plan cancelled during its cooling-off period.", timestamp: "2026-08-15T08:44:10.000Z" },
    ],
    tools: [
      { name: "get_revenue_summary", status: "SUCCEEDED", timestamp: "2026-08-15T08:42:11.000Z", durationMs: 84 },
      { name: "find_revenue_anomalies", status: "SUCCEEDED", timestamp: "2026-08-15T08:42:13.000Z", durationMs: 102 },
      { name: "navigate_to_page", status: "SUCCEEDED", timestamp: "2026-08-15T08:44:06.000Z", durationMs: 18 },
    ],
  },
  ses_01J5Nova72: {
    id: "ses_01J5Nova72", status: "Completed", recordingUrl: null, source: "demo",
    transcript: [
      { role: "user", content: "Take me to urgent support tickets that are still open.", timestamp: "2026-08-14T15:08:04.000Z" },
      { role: "assistant", content: "I filtered the support queue to open, urgent tickets. Two tickets currently match.", timestamp: "2026-08-14T15:08:12.000Z" },
    ],
    tools: [
      { name: "navigate_to_page", status: "SUCCEEDED", timestamp: "2026-08-14T15:08:08.000Z", durationMs: 21 },
      { name: "apply_ticket_filters", status: "SUCCEEDED", timestamp: "2026-08-14T15:08:10.000Z", durationMs: 15 },
    ],
  },
  ses_01J5Nova5K: {
    id: "ses_01J5Nova5K", status: "Completed", recordingUrl: null, source: "demo",
    transcript: [
      { role: "user", content: "Give me the weekly operations overview.", timestamp: "2026-08-12T10:20:04.000Z" },
      { role: "assistant", content: "Revenue is stable, the urgent queue has two active tickets, and all but one knowledge source are ready.", timestamp: "2026-08-12T10:20:17.000Z" },
    ],
    tools: [
      { name: "get_revenue_summary", status: "SUCCEEDED", timestamp: "2026-08-12T10:20:08.000Z", durationMs: 75 },
      { name: "get_ticket_summary", status: "SUCCEEDED", timestamp: "2026-08-12T10:20:10.000Z", durationMs: 61 },
      { name: "search_knowledge", status: "SUCCEEDED", timestamp: "2026-08-12T10:20:13.000Z", durationMs: 91 },
    ],
  },
  ses_01J5Nova3P: {
    id: "ses_01J5Nova3P", status: "Failed", recordingUrl: null, source: "demo",
    transcript: [
      { role: "user", content: "Can you review the support queue?", timestamp: "2026-08-11T13:55:03.000Z" },
    ],
    tools: [],
  },
};

export const activity = [
  { time: "11:42", text: "Refund anomaly detected", meta: "£4,380 · Enterprise annual plan" },
  { time: "10:18", text: "Ticket #1042 escalated", meta: "Product · Urgent" },
  { time: "09:47", text: "Nova completed a revenue review", meta: "5 tools · 6m 14s" },
  { time: "08:31", text: "Knowledge source updated", meta: "Engineering onboarding" },
];
