/**
 * Cerezsiz olcum uc noktasi.
 *
 * Istemci iki tur olay gonderir: sayfa acildiginda "view", sonra periyodik ve
 * sayfadan ayrilirken "ping" (gecen sure ve kaydirma derinligi). Tarayiciya
 * hicbir sey yazilmaz; kimlik sunucuda uretilir.
 */

import { allowedOrigins, clientIp } from "../chat/guard";
import {
  cloudflare,
  heartbeatStatement,
  eventStatement,
  identify,
  isBot,
  looksAutomated,
  readHardware,
  pingStatement,
  scheduleCleanup,
  sessionStatement,
  viewStatement,
  type ClientDetails,
  type D1Statement,
} from "../../lib/analytics";

export const dynamic = "force-dynamic";

/** Govde en fazla 2 KB; olay nesnesi bunun cok altinda. */
const MAX_BODY = 2048;

const NO_CONTENT = new Response(null, {
  status: 204,
  headers: { "cache-control": "no-store" },
});

type Event = {
  type: "view" | "ping" | "event";
  kind: string;
  label: string;
  viewKey: string;
  path: string;
  durationMs: number;
  scroll: number;
  client: ClientDetails;
};

/**
 * Istegin kendi sitemizden geldigini dogrular.
 *
 * Origin basligi tercih edilir; ancak `navigator.sendBeacon` bazi tarayicilarda
 * (ozellikle WebKit) Origin gondermez ya da "null" yazar. Bu durumda Referer
 * uzerinden ayni denetim yapilir — aksi halde telefonlardan gelen olcum
 * sessizce kaybolur.
 */
function fromOurSite(request: Request): boolean {
  const allowed = allowedOrigins();
  const origin = request.headers.get("origin");
  if (origin && origin !== "null") return allowed.includes(origin);

  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    return allowed.includes(new URL(referer).origin);
  } catch {
    return false;
  }
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, max);
}

function count(value: unknown, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return Math.min(Math.round(value * 100) / 100, max);
}

/** Kati cozumleme: beklenmeyen tek bir alan bile olayi gecersiz kilar. */
function parseEvent(raw: string): Event | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }

  const body = parsed as Record<string, unknown>;
  const allowed = [
    "type", "viewKey", "path", "durationMs", "scroll", "kind", "label", "referrer", "utm",
    "screen", "viewport", "pixelRatio", "language", "languages", "timezone",
    "connection", "deviceMemory", "cpuCores", "touch",
  ];
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) return null;
  }

  const type = body.type;
  if (type !== "view" && type !== "ping" && type !== "event") return null;

  // Etkilesim olaylari: yalnizca bilinen turler ve kisa etiketler.
  const kind = typeof body.kind === "string" ? body.kind : "";
  if (type === "event" && !["tiklama", "form", "gonderim"].includes(kind)) {
    return null;
  }
  const label = text(body.label, 120) ?? "";
  if (type === "event" && label.length === 0) return null;

  const viewKey = typeof body.viewKey === "string" ? body.viewKey : "";
  if (!/^[a-z0-9-]{8,64}$/.test(viewKey)) return null;

  const path = text(body.path, 200);
  if (!path || !path.startsWith("/")) return null;

  const duration = body.durationMs;
  const durationMs =
    typeof duration === "number" && Number.isFinite(duration) && duration >= 0
      ? Math.min(Math.round(duration), 6 * 60 * 60 * 1000)
      : 0;

  const scrollValue = body.scroll;
  const scroll =
    typeof scrollValue === "number" && Number.isFinite(scrollValue)
      ? Math.max(0, Math.min(100, Math.round(scrollValue)))
      : 0;

  const object = (value: unknown): Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const utm = object(body.utm);
  const screen = object(body.screen);
  const viewport = object(body.viewport);

  return {
    type,
    kind,
    label,
    viewKey,
    path,
    durationMs,
    scroll,
    client: {
      referrer: text(body.referrer, 300),
      utmSource: text(utm.source, 60),
      utmMedium: text(utm.medium, 60),
      utmCampaign: text(utm.campaign, 60),
      screenWidth: count(screen.width, 20000),
      screenHeight: count(screen.height, 20000),
      viewportWidth: count(viewport.width, 20000),
      viewportHeight: count(viewport.height, 20000),
      pixelRatio: count(body.pixelRatio, 10),
      language: text(body.language, 16),
      languages: text(body.languages, 80),
      timezone: text(body.timezone, 60),
      connection: text(body.connection, 20),
      deviceMemory: count(body.deviceMemory, 1024),
      cpuCores: count(body.cpuCores, 256),
      touch: body.touch === true ? 1 : body.touch === false ? 0 : null,
    },
  };
}

export async function POST(request: Request): Promise<Response> {
  // Yanit her durumda 204: olcum istemcinin isleyisini hicbir zaman etkilemez
  // ve disariya sitenin ic durumu hakkinda bilgi sizdirmaz.
  if (!fromOurSite(request)) return NO_CONTENT;

  const declared = request.headers.get("content-length");
  if (declared !== null && Number(declared) > MAX_BODY) return NO_CONTENT;

  const userAgent = request.headers.get("user-agent") ?? "";
  if (isBot(userAgent)) return NO_CONTENT;

  const raw = await request.text();
  if (raw.length > MAX_BODY) return NO_CONTENT;

  const event = parseEvent(raw);
  if (!event) return NO_CONTENT;

  const context = await cloudflare();
  const db = context?.env.ANALYTICS;
  const salt = process.env.ANALYTICS_SALT;
  if (!context || !db || !salt) return NO_CONTENT;

  const ip = clientIp(request);
  const ids = await identify(ip, userAgent, salt);
  const now = Date.now();

  const hardware = readHardware(request.headers, userAgent);

  if (event.type === "event") {
    try {
      await db.batch([
        heartbeatStatement(db, ids.session, now, hardware),
        eventStatement(db, ids, event.path, event.kind, event.label, now),
      ]);
    } catch (error) {
      console.error("etkilesim yazilamadi", error);
    }
    return NO_CONTENT;
  }

  const statements: D1Statement[] =
    event.type === "view"
      ? [
          sessionStatement(
            db,
            ids,
            context.cf,
            userAgent,
            now,
            event.client,
            looksAutomated(
              context.cf?.asOrganization,
              request.headers.get("accept-language")
            ),
            hardware
          ),
          // Sunucu tarafli kayit (proxy.ts) ayni gosterimi saniyeler once
          // yazmis olabilir; on saniyelik pencere ikizi engeller.
          viewStatement(db, ids, event.path, event.viewKey, now, 10_000),
        ]
      : [
          heartbeatStatement(db, ids.session, now, hardware),
          pingStatement(db, ids.session, event.path, event.durationMs, event.scroll),
        ];

  try {
    await db.batch(statements);
  } catch (error) {
    console.error("olcum yazilamadi", error);
  }

  scheduleCleanup(context, db);
  return NO_CONTENT;
}
