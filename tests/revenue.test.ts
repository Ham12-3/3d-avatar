import { describe, expect, it } from "vitest";
import { revenueData } from "@/lib/data/demo";
import { compareRevenue, findRevenueAnomalies, revenueToCsv, summarizeRevenue } from "@/lib/data/revenue";

describe("revenue calculations", () => {
  it("calculates net revenue from gross less refunds", () => {
    const result=summarizeRevenue([{date:"2026-01-01",gross:1000,refunds:125,net:875}],1);
    expect(result).toMatchObject({gross:1000,refunds:125,revenue:875,currency:"GBP"});
  });
  it("compares the selected period with the immediately previous period", () => {
    const result=compareRevenue(revenueData,30);
    expect(result.days).toBe(30); expect(result.previousPeriodRevenue).toBeGreaterThan(0); expect(Number.isFinite(result.percentageChange)).toBe(true);
  });
  it("identifies the seeded large-refund anomaly", () => {
    const anomalies=findRevenueAnomalies(revenueData,90);
    expect(anomalies.some((item)=>item.refunds===4380&&item.likelyCause==="Large refund")).toBe(true);
  });
  it("exports an Excel-friendly revenue ledger", () => {
    const csv=revenueToCsv([{date:"2026-01-01",gross:1000,refunds:125,net:875}]);
    expect(csv).toBe("Date,Gross,Refunds,Net,Currency\r\n2026-01-01,1000.00,125.00,875.00,GBP");
  });
});
