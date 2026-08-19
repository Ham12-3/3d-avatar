import { logEvent } from "@/lib/observability/logger";

export type AnalyticsEvent = "avatar_session_started" | "avatar_session_completed" | "avatar_session_failed" | "screen_share_started" | "screen_share_stopped" | "client_tool_called" | "server_tool_called" | "dashboard_page_visited";
export async function track(event: AnalyticsEvent, properties: Record<string, unknown> = {}) { logEvent("info", `analytics.${event}`, properties); }
