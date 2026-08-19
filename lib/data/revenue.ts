import type { RevenuePoint } from "@/lib/domain/types";

export function summarizeRevenue(data: RevenuePoint[], days: number) {
  const slice = data.slice(-days);
  const gross = slice.reduce((sum, point) => sum + point.gross, 0);
  const refunds = slice.reduce((sum, point) => sum + point.refunds, 0);
  const net = slice.reduce((sum, point) => sum + point.net, 0);
  return { period: `${days}d`, gross, refunds, revenue: net, currency: "GBP", days: slice.length };
}

export function compareRevenue(data: RevenuePoint[], days: number) {
  const current = summarizeRevenue(data, days);
  const previousSlice = data.slice(-(days * 2), -days);
  const previous = summarizeRevenue(previousSlice, days);
  const percentageChange = previous.revenue === 0 ? 0 : ((current.revenue - previous.revenue) / previous.revenue) * 100;
  return { ...current, previousPeriodRevenue: previous.revenue, percentageChange: Number(percentageChange.toFixed(2)) };
}

export function findRevenueAnomalies(data: RevenuePoint[], days = 90) {
  const slice = data.slice(-days);
  const average = slice.reduce((sum, point) => sum + point.net, 0) / slice.length;
  return slice
    .filter((point) => point.net < average * 0.72 || point.refunds > 1000)
    .map((point) => ({ ...point, variancePercent: Number((((point.net - average) / average) * 100).toFixed(1)), likelyCause: point.refunds > 1000 ? "Large refund" : "Revenue below baseline" }))
    .sort((a, b) => a.net - b.net);
}

export const formatCurrency = (value: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value);

export function revenueToCsv(data: RevenuePoint[]) {
  const rows = data.map((point) => [point.date, point.gross.toFixed(2), point.refunds.toFixed(2), point.net.toFixed(2), "GBP"]);
  return ["Date,Gross,Refunds,Net,Currency", ...rows.map((row) => row.join(","))].join("\r\n");
}
