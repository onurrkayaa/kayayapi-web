/**
 * Cerezsiz analitigin ortak parcalari: gunluk anonim oturum kimligi, D1
 * baglantisi, User-Agent cozumlemesi ve saklama suresi temizligi.
 *
 * Tarayiciya hicbir sey yazilmaz. Iki kimlik uretilir: gun icinde gecerli olan
 * oturum kimligi ve tarihsiz, kalici ziyaretci kimligi. Ikisi de tek yonlu
 * ozettir; ham IP adresi hicbir yerde saklanmaz.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Kayitlar bu sure sonunda otomatik silinir. */
export const RETENTION_DAYS = 90;

/**
 * D1 ve cf ozelliklerinin bu dosyada kullanilan yuzeyi. Yalnizca bunun icin
 * @cloudflare/workers-types bagimliligi eklenmedi; asagisi tam olarak
 * kullandigimiz kadari.
 */
export type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  run: () => Promise<unknown>;
  all: <T>() => Promise<{ results: T[] }>;
};

export type D1Database = {
  prepare: (query: string) => D1Statement;
  batch: (statements: D1Statement[]) => Promise<unknown[]>;
};

/** Cloudflare edge'inin istege ekledigi konum alanlari. */
type CfProperties = {
  city?: string;
  country?: string;
  region?: string;
  postalCode?: string;
  timezone?: string;
  latitude?: string;
  longitude?: string;
  continent?: string;
  colo?: string;
  asOrganization?: string;
  asn?: number;
  httpProtocol?: string;
  tlsVersion?: string;
};

export type Cf = CfProperties;

export type Context = {
  env: { ANALYTICS?: D1Database };
  cf: CfProperties | undefined;
  ctx: { waitUntil: (promise: Promise<unknown>) => void };
};

/** Worker baglami; yerelde wrangler'in miniflare ornegi uzerinden gelir. */
export async function cloudflare(): Promise<Context | null> {
  try {
    return (await getCloudflareContext({ async: true })) as unknown as Context;
  } catch {
    // Baglam yoksa (ornegin saf `next build` sirasinda) olcum sessizce durur.
    return null;
  }
}

/* ------------------------------------------------------------ Oturum kimligi */

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Gun siniri Turkiye saatine gore cizilir. */
export function dayKey(now: Date = new Date()): string {
  return dayFormatter.format(now);
}

/** Ic ozet yardimcisi: metni SHA256'lar ve 32 haneye kisaltir. */
async function digest(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

/**
 * SHA256(IP + UA + gun + gizli tuz) — geri cevrilemez ve gun degisince yenilenir.
 * Bir gunluk ziyareti temsil eder.
 */
export async function sessionId(
  ip: string,
  userAgent: string,
  salt: string,
  day: string = dayKey()
): Promise<string> {
  return digest(`${ip}|${userAgent}|${day}|${salt}`);
}

/**
 * IP adresinin ag bolumu: IPv4'te ilk uc sekizli, IPv6'da ilk uc oktet.
 * Ev ve ofis baglantilarinda son hane zamanla degisebildigi icin, ayni
 * ziyaretciyi haftalar sonra taniyabilmek adina son bolum atilir.
 */
export function networkPrefix(ip: string): string {
  if (ip.includes(":")) return ip.split(":").slice(0, 3).join(":");
  return ip.split(".").slice(0, 3).join(".");
}

/**
 * Tarihsiz, kalici ziyaretci kimligi: ag bolumu + cihaz profili + tuz.
 *
 * Tarayici surumu bilerek disarida birakilir; aksi halde her Chrome
 * guncellemesinden sonra ayni kisi yeni biri gibi gorunurdu. Bunun bedeli,
 * ayni agdan ayni cihaz ve tarayiciyla giren iki kisinin tek ziyaretci gibi
 * sayilabilmesidir. Cerezsiz calisirken bu kacinilmaz bir takas.
 */
export async function visitorId(
  ip: string,
  agent: Agent,
  salt: string
): Promise<string> {
  return digest(
    `${networkPrefix(ip)}|${agent.device}|${agent.os}|${agent.browser}|${salt}`
  );
}

/* ------------------------------------------------------- User-Agent okumasi */

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python-requests|facebookexternalhit|whatsapp|telegram|discord|semrush|ahrefs|petal|yandex/i;

/** Belirgin bot trafigi tabloya hic girmesin. */
export function isBot(userAgent: string): boolean {
  return userAgent.length === 0 || BOT.test(userAgent);
}

/**
 * Bilinen barindirma ve bulut saglayicilari. Gercek ziyaretciler operator ya da
 * ev internetinden gelir; veri merkezi IP'lerinden gelen "iPhone" trafigi
 * neredeyse her zaman siteleri tarayan otomatik yazilimdir.
 */
const HOSTING =
  /amazon|aws|google cloud|microsoft|azure|tencent|alibaba|aliyun|digitalocean|linode|akamai|ovh|hetzner|contabo|scaleway|oracle|vultr|leaseweb|choopa|m247|datacamp|censys|shodan|stretchoid|hostinger|godaddy|namecheap|colocrossing|quadranet|zenlayer|ucloud|huawei|psychz|gcore|selectel|beget|timeweb|cloudsigma|hostwinds|ionos|netcup|serverius|worldstream|datapacket|packethub|fdcservers|nforce|xhost|host europe|hosting|datacenter|data center|colo|vps|cloud|server|rack|quay|digital ocean|limited liability|holdings|ltd\b.*(net|tech|data)/i;

/**
 * Ziyaretin otomatik olup olmadigini degerlendirir.
 *
 * Iki isaret aranir: veri merkezi kaynakli baglanti ve Accept-Language
 * basliginin hic gonderilmemesi. Gercek tarayicilar dil tercihini her zaman
 * bildirir; tarayici taklidi yapan betikler cogunlukla bildirmez. Kayit yine de
 * silinmez, yalnizca isaretlenir.
 */
export function looksAutomated(
  organization: string | null | undefined,
  acceptLanguage: string | null
): boolean {
  if (organization && HOSTING.test(organization)) return true;
  return acceptLanguage === null || acceptLanguage.trim().length === 0;
}

export type Agent = {
  device: string;
  os: string;
  osVersion: string | null;
  browser: string;
  browserVersion: string | null;
};

function match(ua: string, pattern: RegExp): string | null {
  const found = ua.match(pattern);
  return found ? found[1].replace(/_/g, ".") : null;
}

/**
 * Kucuk ve kasitli olarak kaba bir cozumleme. Ham User-Agent dizesi ayrica
 * oldugu gibi saklandigi icin, burada kacan bir ayrinti panelde yine gorulebilir.
 */
export function parseAgent(ua: string): Agent {
  const tablet = /ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua);
  const mobile = !tablet && /mobile|iphone|ipod|android|blackberry|windows phone/i.test(ua);
  const device = tablet ? "Tablet" : mobile ? "Telefon" : "Masaüstü";

  let os = "Bilinmiyor";
  let osVersion: string | null = null;
  if (/iphone|ipad|ipod/i.test(ua)) {
    os = "iOS";
    osVersion = match(ua, /os (\d+[\d_]*) like mac os/i);
  } else if (/android/i.test(ua)) {
    os = "Android";
    osVersion = match(ua, /android (\d+[\d.]*)/i);
  } else if (/windows nt/i.test(ua)) {
    os = "Windows";
    const nt = match(ua, /windows nt (\d+[\d.]*)/i);
    osVersion = nt === "10.0" ? "10/11" : nt;
  } else if (/mac os x|macintosh/i.test(ua)) {
    os = "macOS";
    osVersion = match(ua, /mac os x (\d+[\d._]*)/i);
  } else if (/cros/i.test(ua)) {
    os = "ChromeOS";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  }

  let browser = "Bilinmiyor";
  let browserVersion: string | null = null;
  // Uygulama ici tarayicilar once kontrol edilir: Instagram ve Facebook'un
  // WebView'i Safari/Chrome imzasini da tasir, once bakilmazsa yanlis
  // etiketlenirler. Ziyaretin uygulama icinden geldigini bilmek degerli.
  if (/instagram/i.test(ua)) {
    browser = "Instagram";
  } else if (/fbav|fban|fb_iab|fbios/i.test(ua)) {
    browser = "Facebook";
  } else if (/edg\//i.test(ua)) {
    browser = "Edge";
    browserVersion = match(ua, /edg\/(\d+[\d.]*)/i);
  } else if (/opr\/|opera/i.test(ua)) {
    browser = "Opera";
    browserVersion = match(ua, /opr\/(\d+[\d.]*)/i);
  } else if (/samsungbrowser/i.test(ua)) {
    browser = "Samsung Internet";
    browserVersion = match(ua, /samsungbrowser\/(\d+[\d.]*)/i);
  } else if (/firefox|fxios/i.test(ua)) {
    browser = "Firefox";
    browserVersion = match(ua, /(?:firefox|fxios)\/(\d+[\d.]*)/i);
  } else if (/chrome|crios/i.test(ua)) {
    browser = "Chrome";
    browserVersion = match(ua, /(?:chrome|crios)\/(\d+[\d.]*)/i);
  } else if (/safari/i.test(ua)) {
    browser = "Safari";
    browserVersion = match(ua, /version\/(\d+[\d.]*)/i);
  }

  return { device, os, osVersion, browser, browserVersion };
}


/* ------------------------------------------------------------- Cihaz modeli */

/**
 * Apple donanim kodlarinin okunur karsiliklari.
 *
 * Safari model bilgisini gizler; ancak Instagram ve Facebook'un uygulama ici
 * tarayicilari user-agent'a donanim kodunu ("iPhone14,5") ekler. Tablo bilinen
 * modelleri kapsar; tanimadigi kod oldugu gibi gosterilir, boylece yanlis
 * etiket yerine ham veri gorunur.
 */
const APPLE_MODELS: Record<string, string> = {
  "iPhone10,1": "iPhone 8", "iPhone10,4": "iPhone 8",
  "iPhone10,2": "iPhone 8 Plus", "iPhone10,5": "iPhone 8 Plus",
  "iPhone10,3": "iPhone X", "iPhone10,6": "iPhone X",
  "iPhone11,2": "iPhone XS", "iPhone11,4": "iPhone XS Max",
  "iPhone11,6": "iPhone XS Max", "iPhone11,8": "iPhone XR",
  "iPhone12,1": "iPhone 11", "iPhone12,3": "iPhone 11 Pro",
  "iPhone12,5": "iPhone 11 Pro Max", "iPhone12,8": "iPhone SE (2. nesil)",
  "iPhone13,1": "iPhone 12 mini", "iPhone13,2": "iPhone 12",
  "iPhone13,3": "iPhone 12 Pro", "iPhone13,4": "iPhone 12 Pro Max",
  "iPhone14,4": "iPhone 13 mini", "iPhone14,5": "iPhone 13",
  "iPhone14,2": "iPhone 13 Pro", "iPhone14,3": "iPhone 13 Pro Max",
  "iPhone14,6": "iPhone SE (3. nesil)",
  "iPhone14,7": "iPhone 14", "iPhone14,8": "iPhone 14 Plus",
  "iPhone15,2": "iPhone 14 Pro", "iPhone15,3": "iPhone 14 Pro Max",
  "iPhone15,4": "iPhone 15", "iPhone15,5": "iPhone 15 Plus",
  "iPhone16,1": "iPhone 15 Pro", "iPhone16,2": "iPhone 15 Pro Max",
  "iPhone17,3": "iPhone 16", "iPhone17,4": "iPhone 16 Plus",
  "iPhone17,1": "iPhone 16 Pro", "iPhone17,2": "iPhone 16 Pro Max",
  "iPhone17,5": "iPhone 16e",
};

/**
 * Cihaz modelini cikarir.
 *
 * Uc kaynak sirayla denenir: Client Hints basligi (Android Chrome'da kesin
 * model), Android user-agent'indaki model kodu, Apple donanim kodu.
 */
export function deviceModel(ua: string, hintModel: string | null): string | null {
  const hint = hintModel?.replace(/^"|"$/g, "").trim();
  if (hint) return hint.slice(0, 60);

  const apple = ua.match(/\((iPhone|iPad|iPod)(\d+,\d+)/);
  if (apple) {
    const code = `${apple[1]}${apple[2]}`;
    return APPLE_MODELS[code] ?? code;
  }

  const android = ua.match(/Android [\d.]+;\s*([^;)]+?)(?:\s+Build\/|[;)])/i);
  if (android) {
    const model = android[1].trim();
    if (model && !/^wv$/i.test(model)) return model.slice(0, 60);
  }

  return null;
}

/** Client Hints basliklarindan tirnak ve fazlaliklari temizler. */
export function hint(value: string | null): string | null {
  if (!value) return null;
  const clean = value.replace(/^"|"$/g, "").trim();
  return clean.length === 0 ? null : clean.slice(0, 60);
}

/* --------------------------------------------------------- Ortak kayit SQL */

export type Ids = { session: string; visitor: string; agent: Agent };

/** Bir istekten oturum ve ziyaretci kimliklerini birlikte uretir. */
export async function identify(
  ip: string,
  userAgent: string,
  salt: string
): Promise<Ids> {
  const agent = parseAgent(userAgent);
  const [session, visitor] = await Promise.all([
    sessionId(ip, userAgent, salt),
    visitorId(ip, agent, salt),
  ]);
  return { session, visitor, agent };
}

/** Tarayicinin bildirdigi, yalnizca istemciden gelebilen alanlar. */
export type ClientDetails = {
  screenWidth: number | null;
  screenHeight: number | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  pixelRatio: number | null;
  language: string | null;
  languages: string | null;
  timezone: string | null;
  connection: string | null;
  deviceMemory: number | null;
  cpuCores: number | null;
  touch: number | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

/** User-agent ve Client Hints'ten cozulen donanim ayrintilari. */
export type Hardware = {
  model: string | null;
  platformVersion: string | null;
  architecture: string | null;
};

export const EMPTY_HARDWARE: Hardware = {
  model: null,
  platformVersion: null,
  architecture: null,
};

/** Istek basliklarindan donanim ayrintilarini toplar. */
export function readHardware(headers: Headers, userAgent: string): Hardware {
  return {
    model: deviceModel(userAgent, headers.get("sec-ch-ua-model")),
    platformVersion: hint(headers.get("sec-ch-ua-platform-version")),
    architecture: hint(headers.get("sec-ch-ua-arch")),
  };
}

export const EMPTY_CLIENT: ClientDetails = {
  screenWidth: null,
  screenHeight: null,
  viewportWidth: null,
  viewportHeight: null,
  pixelRatio: null,
  language: null,
  languages: null,
  timezone: null,
  connection: null,
  deviceMemory: null,
  cpuCores: null,
  touch: null,
  referrer: null,
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
};

/**
 * Oturum satirini yazar ya da tazeler.
 *
 * Ayni oturum hem sunucudan (sayfa istegi) hem tarayicidan bildirilir; hangisi
 * once gelirse gelsin bilgi kaybolmasin diye guncellemede coalesce kullanilir:
 * dolu bir alan bos bir degerle EZILMEZ.
 */
export function sessionStatement(
  db: D1Database,
  ids: Ids,
  cf: Cf | undefined,
  userAgent: string,
  now: number,
  client: ClientDetails,
  bot: boolean,
  hardware: Hardware
): D1Statement {
  return db
    .prepare(
      `INSERT INTO sessions
         (id, visitor_id, started_at, last_seen_at, bot,
          country, city, region, postal_code, timezone, latitude, longitude,
          continent, colo, isp, asn, http_protocol, tls_version,
          device, device_model, os, os_version, platform_version, architecture,
          browser, browser_version, user_agent,
          screen_width, screen_height, viewport_width, viewport_height,
          pixel_ratio, language, languages, client_timezone, connection,
          device_memory, cpu_cores, touch,
          referrer, utm_source, utm_medium, utm_campaign)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
               ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         last_seen_at     = excluded.last_seen_at,
         device_model     = coalesce(sessions.device_model, excluded.device_model),
         platform_version = coalesce(sessions.platform_version, excluded.platform_version),
         architecture     = coalesce(sessions.architecture, excluded.architecture),
         screen_width    = coalesce(sessions.screen_width, excluded.screen_width),
         screen_height   = coalesce(sessions.screen_height, excluded.screen_height),
         viewport_width  = coalesce(sessions.viewport_width, excluded.viewport_width),
         viewport_height = coalesce(sessions.viewport_height, excluded.viewport_height),
         pixel_ratio     = coalesce(sessions.pixel_ratio, excluded.pixel_ratio),
         language        = coalesce(sessions.language, excluded.language),
         languages       = coalesce(sessions.languages, excluded.languages),
         client_timezone = coalesce(sessions.client_timezone, excluded.client_timezone),
         connection      = coalesce(sessions.connection, excluded.connection),
         device_memory   = coalesce(sessions.device_memory, excluded.device_memory),
         cpu_cores       = coalesce(sessions.cpu_cores, excluded.cpu_cores),
         touch           = coalesce(sessions.touch, excluded.touch),
         referrer        = coalesce(sessions.referrer, excluded.referrer),
         utm_source      = coalesce(sessions.utm_source, excluded.utm_source),
         utm_medium      = coalesce(sessions.utm_medium, excluded.utm_medium),
         utm_campaign    = coalesce(sessions.utm_campaign, excluded.utm_campaign)`
    )
    .bind(
      ids.session, ids.visitor, now, now, bot ? 1 : 0,
      cf?.country ?? null, cf?.city ?? null, cf?.region ?? null,
      cf?.postalCode ?? null, cf?.timezone ?? null,
      cf?.latitude ?? null, cf?.longitude ?? null,
      cf?.continent ?? null, cf?.colo ?? null,
      cf?.asOrganization ?? null, cf?.asn ?? null,
      cf?.httpProtocol ?? null, cf?.tlsVersion ?? null,
      ids.agent.device, hardware.model, ids.agent.os, ids.agent.osVersion,
      hardware.platformVersion, hardware.architecture,
      ids.agent.browser, ids.agent.browserVersion, userAgent.slice(0, 400),
      client.screenWidth, client.screenHeight,
      client.viewportWidth, client.viewportHeight,
      client.pixelRatio, client.language, client.languages, client.timezone,
      client.connection, client.deviceMemory, client.cpuCores, client.touch,
      client.referrer, client.utmSource, client.utmMedium, client.utmCampaign
    );
}

/**
 * Sayfa gosterimini yazar.
 *
 * Ayni gosterim hem sunucudan hem tarayicidan bildirilebildigi icin, son
 * `dedupeMs` icinde ayni oturum ve yol icin bir satir varsa yenisi eklenmez.
 */
export function viewStatement(
  db: D1Database,
  ids: Ids,
  path: string,
  viewKey: string,
  now: number,
  dedupeMs: number
): D1Statement {
  return db
    .prepare(
      `INSERT INTO page_views
         (view_key, session_id, visitor_id, path, entered_at, duration_ms, max_scroll)
       SELECT ?, ?, ?, ?, ?, 0, 0
       WHERE NOT EXISTS (
         SELECT 1 FROM page_views
         WHERE session_id = ? AND path = ? AND entered_at > ?
       )`
    )
    .bind(
      viewKey, ids.session, ids.visitor, path, now,
      ids.session, path, now - dedupeMs
    );
}

/**
 * "Ziyaretci hâlâ sitede" sinyali. Ayni istekte Client Hints geldiyse eksik
 * donanim alanlari da tamamlanir: bu basliklar ilk istekte degil, tarayici
 * Accept-CH'yi gordukten SONRAKI isteklerde gelir.
 */
export function heartbeatStatement(
  db: D1Database,
  sessionKey: string,
  now: number,
  hardware: Hardware
): D1Statement {
  return db
    .prepare(
      `UPDATE sessions
         SET last_seen_at     = ?,
             device_model     = coalesce(device_model, ?),
             platform_version = coalesce(platform_version, ?),
             architecture     = coalesce(architecture, ?)
       WHERE id = ?`
    )
    .bind(now, hardware.model, hardware.platformVersion, hardware.architecture, sessionKey);
}

/** Tiklama ve form etkilesimlerini yazar. */
export function eventStatement(
  db: D1Database,
  ids: Ids,
  path: string,
  kind: string,
  label: string,
  now: number
): D1Statement {
  return db
    .prepare(
      `INSERT INTO events (session_id, visitor_id, at, path, kind, label)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(ids.session, ids.visitor, now, path, kind, label.slice(0, 120));
}

/**
 * Sure ve kaydirma guncellemesi. Satir view_key ile degil, oturumun o yoldaki
 * EN SON satiri uzerinden bulunur: boylece gosterimi sunucu yazmis, sureyi
 * tarayici bildirmis olsa da ikisi ayni satirda bulusur.
 */
export function pingStatement(
  db: D1Database,
  sessionKey: string,
  path: string,
  durationMs: number,
  scroll: number
): D1Statement {
  return db
    .prepare(
      `UPDATE page_views
         SET duration_ms = max(duration_ms, ?), max_scroll = max(max_scroll, ?)
       WHERE view_key = (
         SELECT view_key FROM page_views
         WHERE session_id = ? AND path = ?
         ORDER BY entered_at DESC LIMIT 1
       )`
    )
    .bind(durationMs, scroll, sessionKey, path);
}

/* ------------------------------------------------------------------ Temizlik */

const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;
let lastCleanup = 0;

/**
 * Saklama suresini gecen satirlari siler. Ayri bir cron tetikleyicisi yerine
 * olcum istegine iliskilendirilir: izolasyon basina en fazla alti saatte bir
 * calisir ve yanit beklemez.
 */
export function scheduleCleanup(context: Context, db: D1Database): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const work = db
    .batch([
      db.prepare("DELETE FROM page_views WHERE entered_at < ?").bind(cutoff),
      db.prepare("DELETE FROM chat_questions WHERE asked_at < ?").bind(cutoff),
      db.prepare("DELETE FROM sessions WHERE started_at < ?").bind(cutoff),
    ])
    .then(() => undefined)
    .catch((error: unknown) => {
      console.error("analitik temizligi basarisiz", error);
    });

  context.ctx.waitUntil(work);
}
