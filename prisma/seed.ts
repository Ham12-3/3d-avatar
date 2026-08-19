import { PrismaClient, KnowledgeStatus, TicketPriority, TicketStatus } from "@prisma/client";
import { knowledgeDocuments, revenueData, supportTickets } from "../lib/data/demo";

const prisma = new PrismaClient();

async function main() {
  await prisma.appUser.upsert({
    where: { id: "demo-user" },
    update: {},
    create: {
      id: "demo-user",
      email: "alex@northstar.example",
      displayName: "Alex Morgan",
      preference: { create: { theme: "system", captionsEnabled: true } },
    },
  });

  for (const [index, point] of revenueData.entries()) {
    const entry = await prisma.revenueEntry.upsert({
      where: { transactionId: `rev-day-${point.date}` },
      update: { grossPence: point.gross * 100 },
      create: {
        occurredAt: new Date(`${point.date}T12:00:00.000Z`),
        grossPence: point.gross * 100,
        feePence: Math.round(point.gross * 2.4),
        source: index % 3 === 0 ? "Enterprise" : "Online",
        transactionId: `rev-day-${point.date}`,
      },
    });
    if (point.refunds > 0) {
      await prisma.refund.upsert({
        where: { id: `refund-${point.date}` },
        update: { amountPence: point.refunds * 100 },
        create: { id: `refund-${point.date}`, revenueEntryId: entry.id, amountPence: point.refunds * 100, reason: point.refunds > 1000 ? "Annual plan cancelled during cooling-off period" : "Duplicate charge", occurredAt: new Date(`${point.date}T16:00:00.000Z`) },
      });
    }
  }

  for (const ticket of supportTickets) {
    await prisma.supportTicket.upsert({
      where: { ticketNumber: ticket.id },
      update: {},
      create: { ticketNumber: ticket.id, title: ticket.title, description: ticket.description, status: ticket.status as TicketStatus, priority: ticket.priority as TicketPriority, category: ticket.category, assignedTeam: ticket.assignedTeam, assignedUser: ticket.assignedUser, customer: ticket.customer, createdAt: new Date(ticket.createdAt), updatedAt: new Date(ticket.updatedAt) },
    });
  }

  for (const document of knowledgeDocuments) {
    await prisma.knowledgeDocument.upsert({
      where: { id: document.id },
      update: {},
      create: { id: document.id, name: document.name, type: document.type, content: document.content, status: document.status as KnowledgeStatus, tokenCount: Math.ceil(document.words * 1.35), updatedAt: new Date(`${document.updatedAt}T12:00:00.000Z`) },
    });
  }

  console.log(`Seeded ${revenueData.length} revenue days, ${supportTickets.length} tickets, and ${knowledgeDocuments.length} knowledge documents.`);
}

main().finally(() => prisma.$disconnect());
