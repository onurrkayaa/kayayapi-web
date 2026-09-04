-- Kayayapi cerezsiz analitigi icin D1 semasi.
-- Kurulum:  npx wrangler d1 execute kayayapi-analitik --remote --file=db/schema.sql
-- Yerelde:  npx wrangler d1 execute kayayapi-analitik --local  --file=db/schema.sql

-- Bir ziyaret = bir gun. id gunluk (SHA256(IP + UA + gun + tuz)), visitor_id
-- ise tarihsizdir: ayni kisi haftalar sonra geri geldiginde ayni degeri alir.
-- Ikisi de tek yonlu ozet; ham IP hicbir sutunda saklanmaz.
CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,
  visitor_id    TEXT NOT NULL,
  started_at    INTEGER NOT NULL,
  last_seen_at  INTEGER NOT NULL,

  -- Otomatik trafik isareti. Satir silinmez, yalnizca panelde gosterilmez;
  -- kural yanlis calisirsa veri geri kazanilabilsin diye saklanir.
  bot           INTEGER NOT NULL DEFAULT 0,

  -- Cloudflare edge'inden gelen konum ve ag bilgisi
  country       TEXT,
  city          TEXT,
  region        TEXT,
  postal_code   TEXT,
  timezone      TEXT,
  latitude      TEXT,
  longitude     TEXT,
  continent     TEXT,
  colo          TEXT,
  isp           TEXT,
  asn           INTEGER,
  http_protocol TEXT,
  tls_version   TEXT,

  -- User-Agent'tan cozulen cihaz bilgisi ve ham dizenin kendisi
  device         TEXT,
  device_model   TEXT,
  os             TEXT,
  os_version     TEXT,
  platform_version TEXT,
  architecture   TEXT,
  browser        TEXT,
  browser_version TEXT,
  user_agent     TEXT,

  -- Tarayicinin kendi bildirdigi ayrintilar
  screen_width    INTEGER,
  screen_height   INTEGER,
  viewport_width  INTEGER,
  viewport_height INTEGER,
  pixel_ratio     REAL,
  language        TEXT,
  languages       TEXT,
  client_timezone TEXT,
  connection      TEXT,
  device_memory   REAL,
  cpu_cores       INTEGER,
  touch           INTEGER,

  -- Nereden geldi
  referrer      TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT
);

CREATE INDEX IF NOT EXISTS sessions_started_at ON sessions (started_at);
CREATE INDEX IF NOT EXISTS sessions_last_seen_at ON sessions (last_seen_at);
CREATE INDEX IF NOT EXISTS sessions_visitor ON sessions (visitor_id);

-- Her sayfa gosterimi bir satir. view_key istemcinin urettigi tek kullanimlik
-- kimlik; sure ve kaydirma guncellemeleri bu anahtarla ayni satira yazilir.
CREATE TABLE IF NOT EXISTS page_views (
  view_key    TEXT PRIMARY KEY,
  session_id  TEXT NOT NULL,
  visitor_id  TEXT NOT NULL,
  path        TEXT NOT NULL,
  entered_at  INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  max_scroll  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS page_views_session ON page_views (session_id);
CREATE INDEX IF NOT EXISTS page_views_entered_at ON page_views (entered_at);

-- Ziyaretcinin sayfadaki etkilesimleri: tiklanan baglantilar, form alanlari.
CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  at         INTEGER NOT NULL,
  path       TEXT NOT NULL,
  kind       TEXT NOT NULL,
  label      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS events_session ON events (session_id);
CREATE INDEX IF NOT EXISTS events_at ON events (at);

-- Asistana sorulan sorular; hem gunluk oturuma hem kalici ziyaretciye baglanir.
CREATE TABLE IF NOT EXISTS chat_questions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  asked_at   INTEGER NOT NULL,
  locale     TEXT NOT NULL,
  question   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS chat_questions_session ON chat_questions (session_id);
CREATE INDEX IF NOT EXISTS chat_questions_asked_at ON chat_questions (asked_at);
