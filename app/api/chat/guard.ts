/**
 * /api/chat icin istek denetimleri: Origin, govde boyutu, sema, hiz siniri ve
 * Cloudflare Turnstile dogrulamasi.
 *
 * Her denetim ya null (gec) ya da sabit kodlu bir GuardFailure dondurur.
 * Upstream ayrintisi hicbir zaman disari sizmaz.
 */

import type { Locale } from "../../i18n/dictionary";

export type ChatRole = "user" | "model";
export type ChatMessage = { role: ChatRole; content: string };
export type ChatRequest = {
  messages: ChatMessage[];
  locale: Locale;
  turnstileToken: string;
};

export type GuardFailure = {
  code:
    | "invalid_request"
    | "forbidden"
    | "too_large"
    | "rate_limited"
    | "unavailable";
  status: number;
  retryAfter?: number;
};

export const LIMITS = {
  /** Govde en fazla 8 KB. */
  bodyBytes: 8 * 1024,
  /** Gecmis dahil en fazla 8 mesaj. */
  maxMessages: 8,
  /** Tek mesaj en fazla 1000 karakter. */
  maxMessageChars: 1000,
  /** Tum mesajlar toplam en fazla 4000 karakter. */
  maxTotalChars: 4000,
  perMinute: 5,
  perHour: 30,
  /** Hiz siniri tablosunun ust siniri; dolunca en eski girdiler atilir. */
  rateLimitEntries: 5000,
} as const;

const INVALID: GuardFailure = { code: "invalid_request", status: 400 };
const FORBIDDEN: GuardFailure = { code: "forbidden", status: 403 };

/* ------------------------------------------------------------------ Origin */

function allowedOrigins(): string[] {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const list: string[] = [];
  if (configured) list.push(configured.replace(/\/+$/, ""));
  if (process.env.NODE_ENV !== "production") {
    list.push("http://localhost:3000", "http://127.0.0.1:3000");
  }
  return list;
}

/** Baska bir siteden yapilan cagrilari keser (CSRF ve anahtar hirsizligi). */
export function checkOrigin(request: Request): GuardFailure | null {
  const origin = request.headers.get("origin");
  if (!origin) return FORBIDDEN;
  return allowedOrigins().includes(origin) ? null : FORBIDDEN;
}

/* -------------------------------------------------------------------- Govde */

/**
 * Govdeyi bayt sayarak okur. Content-Length yalan soyleyebilecegi icin akis
 * sirasinda ikinci kez sinirlanir ve sinir asilinca okuma iptal edilir.
 */
export async function readLimitedBody(
  request: Request
): Promise<string | GuardFailure> {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    const size = Number(declared);
    if (!Number.isFinite(size) || size > LIMITS.bodyBytes) {
      return { code: "too_large", status: 413 };
    }
  }

  const body = request.body;
  if (!body) return INVALID;

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > LIMITS.bodyBytes) {
      await reader.cancel();
      return { code: "too_large", status: 413 };
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

/* --------------------------------------------------------------------- Sema */

const ALLOWED_KEYS = ["messages", "locale", "turnstileToken"];

/**
 * Kati whitelist. Istemci model adi, sicaklik, token siniri veya system prompt
 * gonderemez; bilinmeyen tek bir alan bile istegi gecersiz kilar.
 */
export function parseChatRequest(raw: string): ChatRequest | GuardFailure {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return INVALID;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return INVALID;
  }

  const body = parsed as Record<string, unknown>;
  for (const key of Object.keys(body)) {
    if (!ALLOWED_KEYS.includes(key)) return INVALID;
  }

  const { messages, locale, turnstileToken } = body;

  if (locale !== "tr" && locale !== "en") return INVALID;
  if (
    typeof turnstileToken !== "string" ||
    turnstileToken.length === 0 ||
    turnstileToken.length > 2048
  ) {
    return INVALID;
  }
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > LIMITS.maxMessages
  ) {
    return INVALID;
  }

  const clean: ChatMessage[] = [];
  let totalChars = 0;

  for (let index = 0; index < messages.length; index += 1) {
    const item: unknown = messages[index];
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return INVALID;
    }
    const entry = item as Record<string, unknown>;
    if (Object.keys(entry).length !== 2) return INVALID;

    // Roller sirayla donusmek zorunda; ciftler user, tekler model.
    // Bu kural, gecmisin talimat tasiyicisina donusmesini zorlastirir.
    const expected: ChatRole = index % 2 === 0 ? "user" : "model";
    if (entry.role !== expected) return INVALID;
    if (typeof entry.content !== "string") return INVALID;

    const content = entry.content.trim();
    if (content.length === 0 || content.length > LIMITS.maxMessageChars) {
      return INVALID;
    }
    totalChars += content.length;
    if (totalChars > LIMITS.maxTotalChars) return INVALID;

    clean.push({ role: expected, content });
  }

  // Son mesaj kullanicidan gelmeli; aksi hâlde cevaplanacak bir soru yok.
  if (clean[clean.length - 1].role !== "user") return INVALID;

  return { messages: clean, locale, turnstileToken };
}

/* --------------------------------------------------------------- Hiz siniri */

/**
 * Bellek ici kayan pencere. Cloudflare Workers'ta sayac izolasyon basina ayridir,
 * bu yuzden best-effort kabul edilir; asil sinir Cloudflare WAF kuralindadir
 * (Security > WAF > Rate limiting rules, http.request.uri.path eq "/api/chat").
 */
const hits = new Map<string, number[]>();

export function clientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return "unknown";
}

export function checkRateLimit(
  ip: string,
  now: number = Date.now()
): GuardFailure | null {
  const hourAgo = now - 3_600_000;
  const minuteAgo = now - 60_000;

  const recent = (hits.get(ip) ?? []).filter((stamp) => stamp > hourAgo);

  if (recent.length >= LIMITS.perHour) {
    return {
      code: "rate_limited",
      status: 429,
      retryAfter: Math.ceil((recent[0] - hourAgo) / 1000),
    };
  }

  const inMinute = recent.filter((stamp) => stamp > minuteAgo);
  if (inMinute.length >= LIMITS.perMinute) {
    return {
      code: "rate_limited",
      status: 429,
      retryAfter: Math.ceil((inMinute[0] - minuteAgo) / 1000),
    };
  }

  recent.push(now);
  hits.set(ip, recent);

  // Sinirsiz buyumeyi engelle: Map ekleme sirasini korur, en eskiler atilir.
  if (hits.size > LIMITS.rateLimitEntries) {
    for (const key of hits.keys()) {
      hits.delete(key);
      if (hits.size <= LIMITS.rateLimitEntries) break;
    }
  }

  return null;
}

/* ---------------------------------------------------------------- Turnstile */

/**
 * Cloudflare Turnstile token dogrulamasi. Secret yoksa uc nokta hizmet vermez;
 * dogrulanamayan token (ag hatasi dahil) kabul edilmez.
 */
export async function verifyTurnstile(
  token: string,
  ip: string
): Promise<GuardFailure | null> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { code: "unavailable", status: 503 };

  const form = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") form.set("remoteip", ip);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form, signal: AbortSignal.timeout(8_000) }
    );
    const result = (await response.json()) as { success?: boolean };
    return result.success === true ? null : FORBIDDEN;
  } catch {
    return FORBIDDEN;
  }
}
