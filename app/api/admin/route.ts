/**
 * Yonetim panelinin veri kaynagi.
 *
 * Giris yok: panel acilir acilmaz raporu ceker. Tek anahtar panelin kendi
 * adresidir. Panel bulundugu yolu istekle birlikte gonderir; sunucu bunu
 * yalnizca kendisinin bildigi ADMIN_PATH ile karsilastirir. Boylece adresi
 * bilmeyen biri uc noktadan da veri cekemez. Adres site paketinde hicbir
 * yerde gecmez; panel sayfasi kendi URL'sinden okur.
 *
 * Rapor ziyaretci merkezlidir: ayni kisinin farkli gunlerdeki ziyaretleri
 * kalici visitor_id altinda toplanir.
 */

import { checkOrigin } from "../chat/guard";
import { cloudflare, RETENTION_DAYS } from "../../lib/analytics";

export const dynamic = "force-dynamic";

/** Panelde secilebilen araliklar. */
const RANGES = [1, 3, 7, 30] as const;
type Range = (typeof RANGES)[number];

/** "Su anda sitede" sayilan hareketsizlik penceresi. */
const LIVE_WINDOW_MS = 5 * 60 * 1000;

/** Bastaki ve sondaki egik cizgileri temizler; "/panel-x/" ile "/panel-x" ayni sayilir. */
function normalize(path: string): string {
  return path.replace(/\/+$/, "");
}

/** Tek raporda donulen en fazla ziyaret sayisi. */
const MAX_VISITS = 500;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

type SessionRow = {
  id: string;
  visitor_id: string;
  started_at: number;
  last_seen_at: number;
  country: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  timezone: string | null;
  latitude: string | null;
  longitude: string | null;
  continent: string | null;
  colo: string | null;
  isp: string | null;
  asn: number | null;
  http_protocol: string | null;
  tls_version: string | null;
  device: string | null;
  device_model: string | null;
  os: string | null;
  os_version: string | null;
  platform_version: string | null;
  architecture: string | null;
  browser: string | null;
  browser_version: string | null;
  user_agent: string | null;
  screen_width: number | null;
  screen_height: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
  pixel_ratio: number | null;
  language: string | null;
  languages: string | null;
  client_timezone: string | null;
  connection: string | null;
  device_memory: number | null;
  cpu_cores: number | null;
  touch: number | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

type ViewRow = {
  session_id: string;
  path: string;
  entered_at: number;
  duration_ms: number;
  max_scroll: number;
};

type QuestionRow = { session_id: string; asked_at: number; question: string };

type EventRow = {
  session_id: string;
  at: number;
  path: string;
  kind: string;
  label: string;
};

type RollupRow = {
  visitor_id: string;
  first_seen: number;
  last_seen: number;
  visits: number;
};

/** Referrer adresini "google.com" gibi okunur bir kaynaga indirger. */
function sourceLabel(row: SessionRow): string {
  if (row.utm_source) {
    return row.utm_medium ? `${row.utm_source} / ${row.utm_medium}` : row.utm_source;
  }
  if (!row.referrer) return "Doğrudan";
  try {
    return new URL(row.referrer).hostname.replace(/^www\./, "");
  } catch {
    return "Bilinmiyor";
  }
}

function tally(values: string[]): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Array.from(counts, ([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export async function POST(request: Request): Promise<Response> {
  if (checkOrigin(request)) return json({ error: "forbidden" }, 403);

  const raw = await request.text();
  if (raw.length > 1024) return json({ error: "invalid_request" }, 400);

  let body: {
    days?: unknown;
    key?: unknown;
    foreign?: unknown;
    action?: unknown;
    visitorId?: unknown;
  };
  try {
    body = JSON.parse(raw) as typeof body;
  } catch {
    return json({ error: "invalid_request" }, 400);
  }

  // Panelin adresi tek anahtardir.
  const secretPath = process.env.ADMIN_PATH;
  if (!secretPath) return json({ error: "unconfigured" }, 503);
  if (typeof body.key !== "string" || normalize(body.key) !== normalize(secretPath)) {
    return json({ error: "forbidden" }, 403);
  }

  const days: Range = RANGES.includes(body.days as Range) ? (body.days as Range) : 1;

  // Yurt disi ziyaretler varsayilan olarak gizlidir; panel isterse acar.
  const foreign = body.foreign === true;

  const context = await cloudflare();
  const db = context?.env.ANALYTICS;
  if (!db) return json({ error: "unconfigured" }, 503);

  // Bir ziyaretcinin tum izini silme. Geri alinamaz, bu yuzden kimlik bicimi
  // de dogrulanir.
  if (body.action === "sil") {
    const visitorId = body.visitorId;
    if (typeof visitorId !== "string" || !/^[0-9a-f]{32}$/.test(visitorId)) {
      return json({ error: "invalid_request" }, 400);
    }
    await db.batch([
      db.prepare("DELETE FROM page_views WHERE visitor_id = ?").bind(visitorId),
      db.prepare("DELETE FROM events WHERE visitor_id = ?").bind(visitorId),
      db.prepare("DELETE FROM chat_questions WHERE visitor_id = ?").bind(visitorId),
      db.prepare("DELETE FROM sessions WHERE visitor_id = ?").bind(visitorId),
    ]);
    return json({ ok: true });
  }

  const now = Date.now();
  const since = now - days * 24 * 60 * 60 * 1000;
  const liveSince = now - LIVE_WINDOW_MS;

  // Ulke suzgeci: sabit metin olarak kurulur, kullanici girdisi iceremez.
  const domestic = foreign ? "" : " AND (country = 'TR' OR country IS NULL)";
  const domesticJoined = foreign ? "" : " AND (s.country = 'TR' OR s.country IS NULL)";

  const [sessions, views, questions, events, rollups, live] = await Promise.all([
    db
      .prepare(
        `SELECT * FROM sessions WHERE started_at >= ? AND bot = 0${domestic}
         ORDER BY started_at DESC LIMIT ${MAX_VISITS}`
      )
      .bind(since)
      .all<SessionRow>(),
    db
      .prepare(
        `SELECT session_id, path, entered_at, duration_ms, max_scroll FROM page_views
         WHERE session_id IN (
           SELECT id FROM sessions WHERE started_at >= ? AND bot = 0${domestic}
         )
         ORDER BY entered_at ASC LIMIT 5000`
      )
      .bind(since)
      .all<ViewRow>(),
    db
      .prepare(
        `SELECT session_id, asked_at, question FROM chat_questions
         WHERE session_id IN (
           SELECT id FROM sessions WHERE started_at >= ? AND bot = 0${domestic}
         )
         ORDER BY asked_at ASC LIMIT 1000`
      )
      .bind(since)
      .all<QuestionRow>(),
    db
      .prepare(
        `SELECT session_id, at, path, kind, label FROM events
         WHERE session_id IN (
           SELECT id FROM sessions WHERE started_at >= ? AND bot = 0${domestic}
         )
         ORDER BY at ASC LIMIT 2000`
      )
      .bind(since)
      .all<EventRow>(),
    // Secili aralikta gorunen ziyaretcilerin TUM zamanlardaki ozeti: ilk
    // gorulme, son gorulme ve toplam ziyaret sayisi.
    db
      .prepare(
        `SELECT visitor_id,
                MIN(started_at) AS first_seen,
                MAX(last_seen_at) AS last_seen,
                COUNT(*) AS visits
         FROM sessions
         WHERE bot = 0${domestic} AND visitor_id IN (
           SELECT visitor_id FROM sessions WHERE started_at >= ? AND bot = 0${domestic}
         )
         GROUP BY visitor_id`
      )
      .bind(since)
      .all<RollupRow>(),
    // Son bes dakikada aktif olan ziyaretciler ve o aralikta girdikleri
    // sayfalar. LEFT JOIN ziyaretci basina birden cok satir uretebilir.
    db
      .prepare(
        `SELECT s.visitor_id AS visitor_id, v.path AS path FROM sessions s
         LEFT JOIN page_views v
           ON v.session_id = s.id AND v.entered_at >= ?
         WHERE s.last_seen_at >= ? AND s.bot = 0${domesticJoined}`
      )
      .bind(liveSince, liveSince)
      .all<{ visitor_id: string; path: string | null }>(),
  ]);

  const viewsBySession = new Map<string, ViewRow[]>();
  for (const view of views.results) {
    const list = viewsBySession.get(view.session_id) ?? [];
    list.push(view);
    viewsBySession.set(view.session_id, list);
  }

  const questionsBySession = new Map<string, QuestionRow[]>();
  for (const question of questions.results) {
    const list = questionsBySession.get(question.session_id) ?? [];
    list.push(question);
    questionsBySession.set(question.session_id, list);
  }

  const eventsBySession = new Map<string, EventRow[]>();
  for (const item of events.results) {
    const list = eventsBySession.get(item.session_id) ?? [];
    list.push(item);
    eventsBySession.set(item.session_id, list);
  }

  const rollupByVisitor = new Map(rollups.results.map((row) => [row.visitor_id, row]));

  /**
   * Bir ziyaretin sayfalari, sureleri tamamlanmis halde.
   *
   * Sure normalde tarayicidan gelir; ama uygulama ici tarayicilarin bir kismi
   * o istegi engelliyor. Olculemeyen sayfalarda sure, bir sonraki sayfaya
   * gecise (son sayfada oturumun son hareketine) kadar gecen zamandan
   * tahmin edilir ve panelde "~" ile isaretlenir.
   */
  const viewsOf = (session: SessionRow) => {
    const list = viewsBySession.get(session.id) ?? [];
    return list.map((view, index) => {
      const next = list[index + 1];
      let estimated = false;
      let durationMs = view.duration_ms;
      if (durationMs === 0) {
        const until = next ? next.entered_at : session.last_seen_at;
        // Sekmesi acik unutulmus ziyaretler sureyi sismesin diye ust sinir.
        const gap = Math.min(Math.max(0, until - view.entered_at), 30 * 60 * 1000);
        if (gap > 0) {
          durationMs = gap;
          estimated = true;
        }
      }
      return {
        path: view.path,
        enteredAt: view.entered_at,
        durationMs,
        estimated,
        maxScroll: view.max_scroll,
      };
    });
  };

  const visit = (session: SessionRow) => {
    const views = viewsOf(session);
    const wall = Math.max(0, session.last_seen_at - session.started_at);
    const pages = views.reduce((sum, view) => sum + view.durationMs, 0);
    return {
      id: session.id,
      startedAt: session.started_at,
      lastSeenAt: session.last_seen_at,
      durationMs: Math.max(wall, pages),
      live: session.last_seen_at >= liveSince,
      // Giris ve cikis sayfasi: ziyaretin nerede baslayip nerede bittigi.
      entryPath: views[0]?.path ?? null,
      exitPath: views.length > 0 ? views[views.length - 1].path : null,
      events: (eventsBySession.get(session.id) ?? []).map((item) => ({
        at: item.at,
        path: item.path,
        kind: item.kind,
        label: item.label,
      })),
      source: sourceLabel(session),
      referrer: session.referrer,
      campaign: session.utm_campaign,
      views,
      questions: (questionsBySession.get(session.id) ?? []).map((question) => ({
        askedAt: question.asked_at,
        text: question.question,
      })),
    };
  };

  // Ziyaretler kalici kimlik altinda toplanir; sessions sorgusu zaten yeniden
  // eskiye siralı geldigi icin her grubun ilk elemani en son ziyarettir.
  const grouped = new Map<string, SessionRow[]>();
  for (const session of sessions.results) {
    const list = grouped.get(session.visitor_id) ?? [];
    list.push(session);
    grouped.set(session.visitor_id, list);
  }

  const visitors = Array.from(grouped, ([id, list]) => {
    const latest = list[0];
    const rollup = rollupByVisitor.get(id);
    const visits = list.map(visit);
    return {
      id,
      // Panelde okunabilir kisa etiket; kimligin ilk dort hanesi.
      code: id.slice(0, 4).toUpperCase(),
      firstSeenAt: rollup?.first_seen ?? latest.started_at,
      lastSeenAt: rollup?.last_seen ?? latest.last_seen_at,
      totalVisits: rollup?.visits ?? list.length,
      returning: (rollup?.visits ?? list.length) > 1,
      live: visits.some((item) => item.live),
      city: latest.city,
      country: latest.country,
      region: latest.region,
      postalCode: latest.postal_code,
      timezone: latest.timezone,
      latitude: latest.latitude,
      longitude: latest.longitude,
      colo: latest.colo,
      isp: latest.isp,
      asn: latest.asn,
      httpProtocol: latest.http_protocol,
      tlsVersion: latest.tls_version,
      device: latest.device,
      deviceModel: latest.device_model,
      os: latest.os,
      platformVersion: latest.platform_version,
      architecture: latest.architecture,
      osVersion: latest.os_version,
      browser: latest.browser,
      browserVersion: latest.browser_version,
      userAgent: latest.user_agent,
      screenWidth: latest.screen_width,
      screenHeight: latest.screen_height,
      viewportWidth: latest.viewport_width,
      viewportHeight: latest.viewport_height,
      pixelRatio: latest.pixel_ratio,
      language: latest.language,
      languages: latest.languages,
      clientTimezone: latest.client_timezone,
      connection: latest.connection,
      deviceMemory: latest.device_memory,
      cpuCores: latest.cpu_cores,
      touch: latest.touch === 1,
      source: sourceLabel(latest),
      durationMs: visits.reduce((sum, item) => sum + item.durationMs, 0),
      viewCount: visits.reduce((sum, item) => sum + item.views.length, 0),
      questionCount: visits.reduce((sum, item) => sum + item.questions.length, 0),
      visits,
    };
  }).sort((a, b) => b.lastSeenAt - a.lastSeenAt);

  const visitDurations = visitors
    .flatMap((visitor) => visitor.visits)
    .map((item) => item.durationMs)
    .filter((value) => value > 0);

  const pageStats = new Map<string, { views: number; total: number; scroll: number }>();
  for (const visitor of visitors) {
    for (const item of visitor.visits) {
      for (const view of item.views) {
        const entry = pageStats.get(view.path) ?? { views: 0, total: 0, scroll: 0 };
        entry.views += 1;
        entry.total += view.durationMs;
        entry.scroll += view.maxScroll;
        pageStats.set(view.path, entry);
      }
    }
  }

  const liveRows = live.results;

  // Elenen otomatik trafik: gizlendigi bilinsin diye sayisi bildirilir.
  const hidden = await db
    .prepare(
      `SELECT
         sum(CASE WHEN bot = 1 THEN 1 ELSE 0 END) AS otomatik,
         sum(CASE WHEN bot = 0 AND country IS NOT NULL AND country <> 'TR' THEN 1 ELSE 0 END) AS yurtdisi
       FROM sessions WHERE started_at >= ?`
    )
    .bind(since)
    .all<{ otomatik: number | null; yurtdisi: number | null }>();

  return json({
    range: days,
    retentionDays: RETENTION_DAYS,
    hiddenBots: hidden.results[0]?.otomatik ?? 0,
    foreignCount: hidden.results[0]?.yurtdisi ?? 0,
    showingForeign: foreign,
    generatedAt: now,
    live: {
      visitors: new Set(liveRows.map((row) => row.visitor_id)).size,
      pages: tally(
        liveRows.map((row) => row.path).filter((path): path is string => path !== null)
      ),
    },
    totals: {
      visitors: visitors.length,
      returning: visitors.filter((visitor) => visitor.returning).length,
      visits: sessions.results.length,
      views: views.results.length,
      questions: questions.results.length,
      averageDurationMs:
        visitDurations.length === 0
          ? 0
          : Math.round(
              visitDurations.reduce((sum, value) => sum + value, 0) / visitDurations.length
            ),
      truncated: sessions.results.length >= MAX_VISITS,
    },
    topPages: Array.from(pageStats, ([path, entry]) => ({
      path,
      views: entry.views,
      averageDurationMs: Math.round(entry.total / entry.views),
      averageScroll: Math.round(entry.scroll / entry.views),
    }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8),
    topCities: tally(sessions.results.map((row) => row.city ?? "Bilinmiyor")),
    topSources: tally(sessions.results.map(sourceLabel)),
    visitors,
  });
}
