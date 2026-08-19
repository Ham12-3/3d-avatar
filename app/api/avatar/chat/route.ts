import { APICallError, type ModelMessage } from "ai";
import { z } from "zod";

import {
  buildNovaApplicationContext,
  createNovaAgent,
  getNovaModelId,
  getNovaProviderOrder,
} from "@/lib/avatar/nova-agent";
import { requireIdentity } from "@/lib/auth/session";
import { logEvent } from "@/lib/observability/logger";
import { rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const requestSchema = z.object({
  message: z.string().trim().min(1).max(1_000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1_000),
      }),
    )
    .max(8)
    .default([]),
  context: z
    .object({
      path: z.string().max(300),
      revenuePeriod: z.enum(["7", "30", "90"]),
      ticketFilters: z.object({
        status: z.string().max(30),
        priority: z.string().max(30),
        team: z.string().max(60),
      }),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const identity = await requireIdentity();
    const limit = rateLimit(`avatar-chat:${identity.userId}`, 12, 60_000);

    if (!limit.allowed) {
      return Response.json(
        { error: "Nova is receiving too many requests. Please wait a moment." },
        { status: 429 },
      );
    }

    const { message, history, context } = requestSchema.parse(await request.json());
    const startedAt = Date.now();
    const namesApplicationArea =
      /revenue|evenue|revenu|refund|refud|gross|net|income|sales|ticket|tiket|support|customer|knowledge|knowlege|policy|polciy|session|history|setting|theme|caption|microphone|camera/i.test(
        message,
      );
    const retrievalQuestion = namesApplicationArea
      ? message
      : [...history.map((entry) => entry.content), message].join(" ");
    const applicationContext = await buildNovaApplicationContext(
      identity.userId,
      retrievalQuestion,
      context,
    );
    const messages: ModelMessage[] = [
      ...history,
      {
        role: "user",
        content: [
          `Trusted application context: ${applicationContext}`,
          `User request: ${message}`,
        ].join("\n"),
      },
    ];
    let lastModelError: unknown;
    for (const provider of getNovaProviderOrder()) {
      const model = getNovaModelId(provider);
      try {
        const result = await createNovaAgent(provider).generate({
          messages,
          abortSignal: AbortSignal.timeout(provider === "openai" ? 45_000 : 120_000),
        });
        const answer = result.text.trim();

        if (!answer) throw new Error(`${model} returned an empty response.`);

        logEvent("info", "avatar.ai.completed", {
          userId: identity.userId,
          provider,
          model,
          durationMs: Date.now() - startedAt,
          steps: result.steps.length,
        });

        return Response.json({ answer, model, provider });
      } catch (error) {
        lastModelError = error;
        logEvent("warn", "avatar.ai.provider_failed", {
          userId: identity.userId,
          provider,
          model,
          error: error instanceof Error ? error.message : "Unknown model error",
          statusCode: APICallError.isInstance(error) ? error.statusCode : undefined,
        });
      }
    }

    throw lastModelError ?? new Error("No Nova AI provider is configured.");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Enter a message between 1 and 1,000 characters." }, { status: 400 });
    }

    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    logEvent("warn", "avatar.ai.failed", {
      error: error instanceof Error ? error.message : "Unknown local model error",
      statusCode: APICallError.isInstance(error) ? error.statusCode : undefined,
      responseBody: APICallError.isInstance(error) ? error.responseBody : undefined,
    });

    return Response.json(
      { error: "Nova AI is unavailable. Check the OpenAI API key and billing, or start the LM Studio fallback." },
      { status: 503 },
    );
  }
}
