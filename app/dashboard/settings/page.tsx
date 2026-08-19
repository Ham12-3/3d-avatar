import type { Metadata } from "next";
import { cookies } from "next/headers";
import { PageHeading } from "@/components/dashboard/page-heading";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { requireIdentity } from "@/lib/auth/session";
import { demoPreferencesCookie, parseDemoPreferences } from "@/lib/data/preferences";
import { loadUserPreferences } from "@/lib/data/repository";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";
export default async function SettingsPage() { const identity=await requireIdentity(); const preferences=identity.demo?parseDemoPreferences((await cookies()).get(demoPreferencesCookie)?.value):await loadUserPreferences(identity.userId); return <div className="mx-auto max-w-[980px] p-5 sm:p-7 lg:p-9"><PageHeading eyebrow="Workspace" title="Settings" description="Manage appearance, conversation defaults, avatar rendering, and data retention."/><SettingsPanel initialPreferences={preferences}/></div>; }
