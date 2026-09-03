/**
 * Gemini destekli site asistaninin tek uc noktasi.
 *
 * Denetimler guard.ts'te, model cagrisi gemini.ts'te durur; burasi yalnizca
 * sirayi kurar. Sira onemlidir: ucuz kontroller once, ag cagrilari sonra.
 */

import {
  checkOrigin,
  checkRateLimit,
  clientIp,
  parseChatRequest,
  readLimitedBody,
  verifyTurnstile,
  type GuardFailure,
} from "./guard";
import { streamAnswer } from "./gemini";

// Istek basligina ve govdeye bagli oldugu icin onbelleklenemez.
export const dynamic = "force-dynamic";

function fail(failure: GuardFailure): Response {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  };
  if (failure.retryAfter !== undefined) {
    headers["retry-after"] = String(Math.max(1, failure.retryAfter));
  }
  // Yalnizca sabit kod doner; upstream durumu ve govdesi disari cikmaz.
  return new Response(JSON.stringify({ error: failure.code }), {
    status: failure.status,
    headers,
  });
}

export async function POST(request: Request): Promise<Response> {
  const originFailure = checkOrigin(request);
  if (originFailure) return fail(originFailure);

  const body = await readLimitedBody(request);
  if (typeof body !== "string") return fail(body);

  const parsed = parseChatRequest(body);
  if (!("messages" in parsed)) return fail(parsed);

  const ip = clientIp(request);

  // Hiz siniri Turnstile'dan once: dogrulama cagrisi da spam'lenmesin.
  const rateFailure = checkRateLimit(ip);
  if (rateFailure) return fail(rateFailure);

  const turnstileFailure = await verifyTurnstile(parsed.turnstileToken, ip);
  if (turnstileFailure) return fail(turnstileFailure);

  const stream = await streamAnswer(parsed.messages, parsed.locale);
  if (!stream) return fail({ code: "unavailable", status: 503 });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
