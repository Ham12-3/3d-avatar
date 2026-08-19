import type { SupportTicket, TicketPriority, TicketStatus } from "@/lib/domain/types";

export type TicketFilters = { search?: string; status?: TicketStatus | "ALL"; priority?: TicketPriority | "ALL"; team?: string | "ALL" };

export function filterTickets(tickets: SupportTicket[], filters: TicketFilters) {
  const search = filters.search?.trim().toLowerCase();
  return tickets.filter((ticket) => {
    if (filters.status && filters.status !== "ALL" && ticket.status !== filters.status) return false;
    if (filters.priority && filters.priority !== "ALL" && ticket.priority !== filters.priority) return false;
    if (filters.team && filters.team !== "ALL" && ticket.assignedTeam !== filters.team) return false;
    if (search && !`${ticket.id} ${ticket.title} ${ticket.customer}`.toLowerCase().includes(search)) return false;
    return true;
  });
}
