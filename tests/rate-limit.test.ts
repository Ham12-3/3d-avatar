import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/security/rate-limit";

describe("rate limiting",()=>{it("denies requests beyond the configured boundary",()=>{const key=`test-${crypto.randomUUID()}`;expect(rateLimit(key,2).allowed).toBe(true);expect(rateLimit(key,2).allowed).toBe(true);expect(rateLimit(key,2).allowed).toBe(false);});});
