/**
 * Sunucu tarafli ziyaret kaydi.
 *
 * Next 16'da `middleware` yerine `proxy` kullanilir. Burasi her sayfa istegi
 * Worker'a ulastigi anda calisir; bu yuzden olcum, ziyaretcinin tarayicisinda
 * JavaScript hic calismasa bile kaydedilir. Uygulama ici tarayicilar
 * (Instagram, Facebook) ve eski telefonlar bu sayede gorunur olur.
 *
 * Kural: bu dosya istegi ASLA bekletmez ve ASLA hata firlatmaz. Yazma isi
 * `waitUntil` ile arka plana alinir, tum govde korumali bloktadir; olcum
 * calismasa da sayfa normal doner.
 */

import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import {
  cloudflare,
  EMPTY_CLIENT,
  heartbeatStatement,
  identify,
  isBot,
  looksAutomated,
  readHardware,
  sessionStatement,
  viewStatement,
} from "./app/lib/analytics";

export const config = {
  // Sayfa istekleri: API, Next'in ic dosyalari ve uzantili dosyalar disarida.
  matcher: ["/((?!api/|_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};

/** Ayni istegin iki kez yazilmasini onleyen pencere. */
const DEDUPE_MS = 3000;

async function record(request: NextRequest): Promise<void> {
  const salt = process.env.ANALYTICS_SALT;
  if (!salt) return;

  // Panel olculmez.
  const adminPath = process.env.ADMIN_PATH;
  const path = request.nextUrl.pathname;
  if (adminPath && path.startsWith(adminPath)) return;

  const userAgent = request.headers.get("user-agent") ?? "";
  if (isBot(userAgent)) return;

  const context = await cloudflare();
  const db = context?.env.ANALYTICS;
  if (!context || !db) return;

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const ids = await identify(ip, userAgent, salt);
  const now = Date.now();

  // Sayfa gosterimi sayilan tek sey gercek belge istegidir; RSC on yuklemeleri
  // ve veri istekleri yalnizca "ziyaretci hâlâ sitede" sinyali tasir. Bu sayede
  // tek sayfalik ziyaretlerde bile sure olculebilir.
  const accept = request.headers.get("accept") ?? "";
  const isDocument =
    accept.includes("text/html") && !request.nextUrl.searchParams.has("_rsc");

  const hardware = readHardware(request.headers, userAgent);

  if (!isDocument) {
    // Client Hints ilk istekte gelmez; bu istekte geldiyse eksikler tamamlanir.
    await heartbeatStatement(db, ids.session, now, hardware).run();
    return;
  }

  // Disaridan gelen adres ve kampanya bilgisi sunucuda da okunabilir.
  const referer = request.headers.get("referer");
  let referrer: string | null = null;
  if (referer) {
    try {
      if (new URL(referer).host !== request.nextUrl.host) {
        referrer = referer.slice(0, 300);
      }
    } catch {
      referrer = null;
    }
  }
  const params = request.nextUrl.searchParams;
  const client = {
    ...EMPTY_CLIENT,
    referrer,
    utmSource: params.get("utm_source")?.slice(0, 60) ?? null,
    utmMedium: params.get("utm_medium")?.slice(0, 60) ?? null,
    utmCampaign: params.get("utm_campaign")?.slice(0, 60) ?? null,
  };

  const viewKey = `srv-${ids.session.slice(0, 12)}-${now.toString(36)}`;

  const bot = looksAutomated(
    context.cf?.asOrganization,
    request.headers.get("accept-language")
  );

  await db.batch([
    sessionStatement(db, ids, context.cf, userAgent, now, client, bot, hardware),
    viewStatement(db, ids, path, viewKey, now, DEDUPE_MS),
  ]);
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  try {
    event.waitUntil(
      record(request).catch((error: unknown) => {
        console.error("sunucu tarafli olcum basarisiz", error);
      })
    );
  } catch {
    // Olcum hicbir kosulda istegi etkilemez.
  }
  return NextResponse.next();
}
