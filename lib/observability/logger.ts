type LogLevel = "info" | "warn" | "error";
const secretKeys = /secret|token|authorization|password|sessionkey/i;

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key,item])=>[key, secretKeys.test(key) ? "[REDACTED]" : redact(item)]));
  return value;
}

export function logEvent(level: LogLevel, event: string, context: Record<string, unknown> = {}) {
  const redacted = redact(context);
  const safeContext = redacted && typeof redacted === "object" && !Array.isArray(redacted) ? redacted as Record<string, unknown> : {};
  const payload = JSON.stringify({ level, event, at: new Date().toISOString(), ...safeContext });
  if (level === "error") console.error(payload); else if (level === "warn") console.warn(payload); else console.info(payload);
}
