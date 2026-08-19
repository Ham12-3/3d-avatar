import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell authConfigured={Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)} runwayConfigured={Boolean(process.env.RUNWAYML_API_SECRET)} runwayCustomAvatar={process.env.RUNWAY_AVATAR_TYPE==="custom"}>{children}</DashboardShell>;
}
