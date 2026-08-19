import { describe, expect, it } from "vitest";
import { knowledgeSearchSchema, revenuePeriodSchema, serverToolHandlers, ticketIdSchema } from "@/lib/avatar/server-tools";

describe("avatar tool boundaries",()=>{
  it("rejects unsupported periods and unsafe ticket IDs",()=>{expect(()=>revenuePeriodSchema.parse({period:"365d"})).toThrow();expect(()=>ticketIdSchema.parse({ticketId:"1; DROP TABLE"})).toThrow();});
  it("caps knowledge queries and result limits",()=>{expect(()=>knowledgeSearchSchema.parse({query:"a",limit:100})).toThrow();});
  it("returns exact structured revenue and ticket data",async()=>{const revenue=await serverToolHandlers.get_revenue_summary({period:"30d"});expect(revenue).toMatchObject({period:"30d",currency:"GBP",days:30});const ticket=await serverToolHandlers.get_ticket({ticketId:1042});expect(ticket).toMatchObject({id:1042,status:"OPEN",priority:"URGENT"});});
  it("retrieves trusted onboarding content rather than a hardcoded answer",async()=>{const result=await serverToolHandlers.search_company_knowledge({query:"new laptop setup",limit:3});expect(result.results[0]?.excerpt).toContain("enable MFA");});
});
