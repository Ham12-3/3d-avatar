export type RevenuePoint = {
  date: string;
  gross: number;
  refunds: number;
  net: number;
};

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type SupportTicket = {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  assignedTeam: string;
  assignedUser: string;
  customer: string;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeDocument = {
  id: string;
  name: string;
  type: string;
  status: "READY" | "PROCESSING" | "FAILED";
  words: number;
  updatedAt: string;
  content: string;
};

export type SessionRecord = {
  id: string;
  startedAt: string;
  duration: string;
  status: "Completed" | "Active" | "Failed";
  tools: number;
  topic: string;
};

export type UserPreferences = {
  theme: "light" | "dark" | "system";
  captionsEnabled: boolean;
  microphoneDefault: boolean;
  cameraDefault: boolean;
  screenSharePrompt: boolean;
};

export type SessionTranscriptEntry = {
  role: "user" | "assistant";
  content: string | null;
  timestamp: string | null;
};

export type SessionToolEvent = {
  name: string;
  status: string;
  timestamp: string | null;
  durationMs: number | null;
};

export type SessionDetail = {
  id: string;
  status: string;
  transcript: SessionTranscriptEntry[];
  tools: SessionToolEvent[];
  recordingUrl: string | null;
  source: "demo" | "local";
};
