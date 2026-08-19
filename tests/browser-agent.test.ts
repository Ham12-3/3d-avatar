import { describe,expect,it } from "vitest";
import { interpretBrowserCommand } from "@/lib/avatar/browser-agent";

describe("browser Nova command interpreter",()=>{
  it("opens the requested revenue period",()=>{
    expect(interpretBrowserCommand("Show me revenue for 90 days").action).toEqual({type:"revenue",period:90});
  });
  it("prioritises urgent open support requests",()=>{
    expect(interpretBrowserCommand("Open urgent tickets")).toMatchObject({action:{type:"tickets",urgent:true,open:true}});
  });
  it("answers known onboarding questions from the trusted guide",()=>{
    expect(interpretBrowserCommand("What is the laptop onboarding policy?").answer).toContain("request the laptop before the start date");
  });
});
