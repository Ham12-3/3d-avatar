import { describe, expect, it } from "vitest";
import { supportTickets } from "@/lib/data/demo";
import { filterTickets } from "@/lib/data/tickets";

describe("ticket filters",()=>{
  it("combines status and priority filters",()=>{const results=filterTickets(supportTickets,{status:"OPEN",priority:"URGENT"});expect(results.length).toBeGreaterThan(0);expect(results.every((ticket)=>ticket.status==="OPEN"&&ticket.priority==="URGENT")).toBe(true);});
  it("searches ticket IDs, titles and customers case-insensitively",()=>{expect(filterTickets(supportTickets,{search:"1042"})[0]?.id).toBe(1042);expect(filterTickets(supportTickets,{search:"northstar"}).length).toBeGreaterThan(0);});
});
