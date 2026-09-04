"use client";

/**
 * Ziyaretci paneli.
 *
 * Giris yok: sayfa acilinca rapor kendiliginden gelir. Tarayiciya cerez veya
 * depolama yazilmaz. Panelin metinleri Turkce sabittir: site disi, tek
 * kullanicili bir yonetim ekrani oldugu icin sozluk uzerinden cevrilmez.
 */

import { Fragment, useCallback, useEffect, useState } from "react";
import { ChevronDown, Loader2, RefreshCw } from "lucide-react";

type View = {
  path: string;
  enteredAt: number;
  durationMs: number;
  /** Sure tarayicidan degil, sayfalar arasi gecisten tahmin edildi. */
  estimated: boolean;
  maxScroll: number;
};
type Question = { askedAt: number; text: string };

type Interaction = { at: number; path: string; kind: string; label: string };

type Visit = {
  id: string;
  startedAt: number;
  durationMs: number;
  live: boolean;
  entryPath: string | null;
  exitPath: string | null;
  events: Interaction[];
  source: string;
  referrer: string | null;
  campaign: string | null;
  views: View[];
  questions: Question[];
};

type Visitor = {
  id: string;
  code: string;
  firstSeenAt: number;
  lastSeenAt: number;
  totalVisits: number;
  returning: boolean;
  live: boolean;
  city: string | null;
  country: string | null;
  region: string | null;
  postalCode: string | null;
  timezone: string | null;
  latitude: string | null;
  longitude: string | null;
  colo: string | null;
  isp: string | null;
  asn: number | null;
  httpProtocol: string | null;
  tlsVersion: string | null;
  device: string | null;
  deviceModel: string | null;
  os: string | null;
  osVersion: string | null;
  platformVersion: string | null;
  architecture: string | null;
  browser: string | null;
  browserVersion: string | null;
  userAgent: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  pixelRatio: number | null;
  language: string | null;
  languages: string | null;
  clientTimezone: string | null;
  connection: string | null;
  deviceMemory: number | null;
  cpuCores: number | null;
  touch: boolean;
  source: string;
  durationMs: number;
  viewCount: number;
  questionCount: number;
  visits: Visit[];
};

type Report = {
  range: number;
  retentionDays: number;
  generatedAt: number;
  hiddenBots: number;
  foreignCount: number;
  showingForeign: boolean;
  live: { visitors: number; pages: { label: string; count: number }[] };
  totals: {
    visitors: number;
    returning: number;
    visits: number;
    views: number;
    questions: number;
    averageDurationMs: number;
    truncated: boolean;
  };
  topPages: {
    path: string;
    views: number;
    averageDurationMs: number;
    averageScroll: number;
  }[];
  topCities: { label: string; count: number }[];
  topSources: { label: string; count: number }[];
  visitors: Visitor[];
};

const RANGES = [
  { days: 1, label: "Bugün" },
  { days: 3, label: "Son 3 gün" },
  { days: 7, label: "Son 7 gün" },
  { days: 30, label: "Son 30 gün" },
];

const dateTime = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const date = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

const time = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  hour: "2-digit",
  minute: "2-digit",
});

function duration(ms: number): string {
  const total = Math.round(ms / 1000);
  if (total < 60) return `${total} sn`;
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes < 60) return seconds === 0 ? `${minutes} dk` : `${minutes} dk ${seconds} sn`;
  return `${Math.floor(minutes / 60)} sa ${minutes % 60} dk`;
}

/** Bos alanlari eleyerek "a · b · c" bicimine getirir. */
function join(parts: (string | number | null | undefined | false)[]): string {
  const clean = parts.filter((part) => part !== null && part !== undefined && part !== false);
  return clean.length === 0 ? "—" : clean.join(" · ");
}

const ERRORS: Record<string, string> = {
  unconfigured:
    "Sunucu yapılandırması eksik: ADMIN_PATH veya D1 bağlaması tanımlı değil.",
  forbidden: "Bu adres tanınmadı.",
  invalid_request: "İstek işlenemedi.",
  network: "Bağlantı kurulamadı.",
};

export default function AdminPage() {
  const [days, setDays] = useState(1);
  const [foreign, setForeign] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  /**
   * Raporu ceker. Ilk ifadesi bilerek `fetch`: efekt icinden cagrildiginda
   * senkron bir setState calismasin diye durum guncellemeleri yalnizca
   * yanit dondukten sonra yapilir. Bekleme gostergesini cagiran ayarlar.
   */
  const load = useCallback(async (range: number, abroad: boolean) => {
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // Anahtar panelin kendi adresi; sunucu bunu ADMIN_PATH ile karsilastirir.
        body: JSON.stringify({
          days: range,
          foreign: abroad,
          key: window.location.pathname,
        }),
      });
      const payload = (await response.json()) as Report & { error?: string };
      if (!response.ok) {
        setError(ERRORS[payload.error ?? ""] ?? "Beklenmeyen bir hata oluştu.");
        return;
      }
      setError(null);
      setReport(payload);
    } catch {
      setError(ERRORS.network);
    } finally {
      setBusy(false);
    }
  }, []);

  /** Elle yenileme: donen gosterge ile. */
  const refresh = () => {
    setBusy(true);
    void load(days, foreign);
  };

  /** Bir ziyaretcinin tum kayitlarini siler. Geri alinamaz, bu yuzden sorar. */
  const remove = async (visitorId: string, label: string) => {
    if (!window.confirm(`${label} ziyaretçisinin tüm kayıtları silinsin mi? Bu işlem geri alınamaz.`)) {
      return;
    }
    setBusy(true);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "sil",
          visitorId,
          key: window.location.pathname,
        }),
      });
    } catch {
      setError(ERRORS.network);
    }
    setOpen(null);
    void load(days, foreign);
  };

  /**
   * Ilk yukleme ve otuz saniyede bir tazeleme. Aralik degistiginde efekt
   * yeniden kurulur, yani rapor kendiliginden yenilenir. Cagrilar zamanlayici
   * geri cagrimlarindan yapilir; efekt govdesinde senkron durum guncellemesi
   * yoktur.
   */
  useEffect(() => {
    const first = window.setTimeout(() => void load(days, foreign), 0);
    const timer = window.setInterval(() => void load(days, foreign), 30_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [days, foreign, load]);

  if (!report) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bone px-6 text-center">
        <div>
          <span className="mx-auto block h-px w-10 bg-brick" />
          <h1 className="mt-6 text-3xl font-bold uppercase tracking-tight text-brick-deep">
            Ziyaretçi paneli
          </h1>
          {error ? (
            <p className="mt-4 text-sm leading-relaxed text-brick">{error}</p>
          ) : (
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-brick-deep/50">
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              Yükleniyor…
            </p>
          )}
        </div>
      </main>
    );
  }

  const tiles = [
    { label: "Ziyaretçi", value: String(report.totals.visitors) },
    { label: "Tekrar gelen", value: String(report.totals.returning) },
    { label: "Ziyaret", value: String(report.totals.visits) },
    { label: "Sayfa görüntüleme", value: String(report.totals.views) },
    { label: "Ortalama ziyaret", value: duration(report.totals.averageDurationMs) },
    { label: "Asistana soru", value: String(report.totals.questions) },
  ];

  return (
    <main className="min-h-screen bg-bone px-6 py-12 text-brick-deep sm:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-6 border-b border-brick-deep/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-brick" />
              <span className="text-[11px] uppercase tracking-[0.35em] text-brick">
                Kaya Yapı
              </span>
            </div>
            <h1 className="mt-5 text-4xl font-bold uppercase tracking-tight sm:text-5xl">
              Ziyaretçi paneli
            </h1>
          </div>

          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2 text-sm text-brick-deep/70">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brick opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brick" />
              </span>
              Şu an sitede{" "}
              <strong className="font-semibold text-brick-deep">
                {report.live.visitors}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => refresh()}
              className="-m-2 cursor-pointer p-2 text-brick-deep/50 transition-colors hover:text-brick"
              aria-label="Yenile"
            >
              <RefreshCw
                className={`h-4 w-4 ${busy ? "animate-spin" : ""}`}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              onClick={() => {
                setBusy(true);
                setDays(range.days);
              }}
              className={`cursor-pointer border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                days === range.days
                  ? "border-brick bg-brick text-bone"
                  : "border-brick-deep/20 text-brick-deep/70 hover:border-brick hover:text-brick"
              }`}
            >
              {range.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setBusy(true);
              setForeign((current) => !current);
            }}
            className={`ml-auto cursor-pointer border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
              foreign
                ? "border-brick bg-brick text-bone"
                : "border-brick-deep/20 text-brick-deep/70 hover:border-brick hover:text-brick"
            }`}
          >
            Yurt dışı{report.foreignCount > 0 ? ` (${report.foreignCount})` : ""}
          </button>
        </div>

        {error ? (
          <p className="mt-6 border-l-2 border-brick pl-4 text-sm text-brick">{error}</p>
        ) : null}

        <div className="mt-8 grid gap-px border border-brick-deep/15 bg-brick-deep/15 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {tiles.map((tile) => (
            <div key={tile.label} className="bg-bone px-6 py-7">
              <p className="text-[11px] uppercase tracking-[0.25em] text-brick-deep/45">
                {tile.label}
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight">{tile.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <Panel title="En çok görüntülenen sayfalar">
            {report.topPages.map((page) => (
              <Row
                key={page.path}
                left={page.path}
                right={`${page.views} · ${duration(page.averageDurationMs)} · %${page.averageScroll}`}
              />
            ))}
          </Panel>
          <Panel title="Şehirler">
            {report.topCities.map((city) => (
              <Row key={city.label} left={city.label} right={String(city.count)} />
            ))}
          </Panel>
          <Panel title="Trafik kaynağı">
            {report.topSources.map((source) => (
              <Row key={source.label} left={source.label} right={String(source.count)} />
            ))}
          </Panel>
        </div>

        <div className="mt-12 overflow-x-auto" data-native-scroll>
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-brick-deep/15 text-left text-[11px] uppercase tracking-[0.2em] text-brick-deep/45">
                <th className="py-4 pr-4 font-normal">Ziyaretçi</th>
                <th className="py-4 pr-4 font-normal">Son ziyaret</th>
                <th className="py-4 pr-4 font-normal">İlk ziyaret</th>
                <th className="py-4 pr-4 font-normal">Şehir</th>
                <th className="py-4 pr-4 font-normal">Cihaz</th>
                <th className="py-4 pr-4 font-normal">Kaynak</th>
                <th className="py-4 pr-4 font-normal">Süre</th>
                <th className="py-4 pr-4 font-normal">Sayfa</th>
                <th className="py-4 pr-4 font-normal">Soru</th>
                <th className="py-4 font-normal" />
              </tr>
            </thead>
            <tbody>
              {report.visitors.map((visitor) => {
                const expanded = open === visitor.id;
                return (
                  <Fragment key={visitor.id}>
                    <tr
                      onClick={() => setOpen(expanded ? null : visitor.id)}
                      className="cursor-pointer border-b border-brick-deep/10 align-top transition-colors hover:bg-bone-soft"
                    >
                      <td className="py-4 pr-4 whitespace-nowrap">
                        <span className="font-mono text-xs tracking-wider text-brick-deep/70">
                          {visitor.code}
                        </span>
                        {visitor.totalVisits > 1 ? (
                          <span className="ml-2 border border-brick/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-brick">
                            {visitor.totalVisits}. kez
                          </span>
                        ) : null}
                        {visitor.live ? (
                          <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-brick align-middle" />
                        ) : null}
                      </td>
                      <td className="py-4 pr-4 whitespace-nowrap">
                        {dateTime.format(visitor.lastSeenAt)}
                      </td>
                      <td className="py-4 pr-4 whitespace-nowrap text-brick-deep/55">
                        {date.format(visitor.firstSeenAt)}
                      </td>
                      <td className="py-4 pr-4">
                        {visitor.city ?? "—"}
                        {visitor.country ? (
                          <span className="text-brick-deep/40"> · {visitor.country}</span>
                        ) : null}
                      </td>
                      <td className="py-4 pr-4">
                        {visitor.device ?? "—"}
                        <span className="text-brick-deep/40">
                          {" · "}
                          {join([visitor.os, visitor.browser])}
                        </span>
                      </td>
                      <td className="py-4 pr-4">{visitor.source}</td>
                      <td className="py-4 pr-4 whitespace-nowrap">
                        {duration(visitor.durationMs)}
                      </td>
                      <td className="py-4 pr-4">{visitor.viewCount}</td>
                      <td className="py-4 pr-4">
                        {visitor.questionCount > 0 ? (
                          <span className="text-brick">{visitor.questionCount}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <ChevronDown
                          className={`inline h-4 w-4 text-brick-deep/40 transition-transform ${
                            expanded ? "rotate-180" : ""
                          }`}
                          strokeWidth={1.5}
                        />
                      </td>
                    </tr>
                    {expanded ? (
                      <tr className="border-b border-brick-deep/10">
                        <td colSpan={10} className="bg-bone-soft px-5 py-6">
                          <div className="flex flex-col gap-8">
                            {visitor.visits.map((item) => (
                              <div key={item.id} className="grid gap-6 lg:grid-cols-2">
                                <div>
                                  <p className="text-[11px] uppercase tracking-[0.25em] text-brick-deep/45">
                                    {dateTime.format(item.startedAt)} ·{" "}
                                    {duration(item.durationMs)} · {item.source}
                                  </p>
                                  {item.entryPath ? (
                                    <p className="mt-2 text-xs text-brick-deep/50">
                                      Giriş {item.entryPath}
                                      {item.exitPath && item.exitPath !== item.entryPath
                                        ? ` → çıkış ${item.exitPath}`
                                        : ""}
                                    </p>
                                  ) : null}
                                  <ul className="mt-4 flex flex-col gap-2">
                                    {item.views.map((view) => (
                                      <li
                                        key={`${view.path}-${view.enteredAt}`}
                                        className="flex justify-between gap-6 border-b border-brick-deep/10 pb-2"
                                      >
                                        <span>
                                          <span className="text-brick-deep/40">
                                            {time.format(view.enteredAt)}{" "}
                                          </span>
                                          {view.path}
                                        </span>
                                        <span className="whitespace-nowrap text-brick-deep/55">
                                          {view.estimated ? "~" : ""}
                                          {duration(view.durationMs)}
                                          {view.maxScroll > 0 ? ` · %${view.maxScroll}` : ""}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  {item.events.length > 0 ? (
                                    <ul className="mb-5 flex flex-col gap-1.5 text-xs">
                                      {item.events.map((action) => (
                                        <li
                                          key={`${action.at}-${action.label}`}
                                          className="flex gap-3 text-brick-deep/65"
                                        >
                                          <span className="text-brick-deep/35">
                                            {time.format(action.at)}
                                          </span>
                                          <span
                                            className={
                                              action.kind === "gonderim"
                                                ? "text-brick"
                                                : undefined
                                            }
                                          >
                                            {action.label}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : null}
                                  {item.questions.length === 0 ? (
                                    <p className="text-sm text-brick-deep/40">
                                      Bu ziyarette soru sorulmadı.
                                    </p>
                                  ) : (
                                    <ul className="flex flex-col gap-3">
                                      {item.questions.map((question) => (
                                        <li
                                          key={question.askedAt}
                                          className="border-l-2 border-brick pl-4 leading-relaxed"
                                        >
                                          <span className="text-brick-deep/40">
                                            {time.format(question.askedAt)}{" "}
                                          </span>
                                          {question.text}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            ))}

                            <dl className="grid gap-x-8 gap-y-3 border-t border-brick-deep/10 pt-6 text-xs sm:grid-cols-2 lg:grid-cols-3">
                              <Detail
                                label="Konum"
                                value={join([
                                  visitor.city,
                                  visitor.region,
                                  visitor.country,
                                  visitor.postalCode,
                                  visitor.latitude &&
                                    `${visitor.latitude}, ${visitor.longitude}`,
                                ])}
                              />
                              <Detail
                                label="Bağlantı"
                                value={join([
                                  visitor.isp,
                                  visitor.asn && `AS${visitor.asn}`,
                                  visitor.connection,
                                  visitor.colo && `edge: ${visitor.colo}`,
                                ])}
                              />
                              <Detail
                                label="Cihaz"
                                value={join([
                                  visitor.deviceModel,
                                  visitor.device,
                                  visitor.architecture,
                                ])}
                              />
                              <Detail
                                label="Sistem"
                                value={join([
                                  visitor.os &&
                                    `${visitor.os} ${
                                      visitor.platformVersion ?? visitor.osVersion ?? ""
                                    }`.trim(),
                                  visitor.browser &&
                                    `${visitor.browser} ${visitor.browserVersion ?? ""}`.trim(),
                                  visitor.touch ? "dokunmatik" : "dokunmatik değil",
                                ])}
                              />
                              <Detail
                                label="Ekran"
                                value={join([
                                  visitor.screenWidth &&
                                    `${visitor.screenWidth}×${visitor.screenHeight}`,
                                  visitor.viewportWidth &&
                                    `pencere ${visitor.viewportWidth}×${visitor.viewportHeight}`,
                                  visitor.pixelRatio && `${visitor.pixelRatio}x`,
                                ])}
                              />
                              <Detail
                                label="Donanım / dil"
                                value={join([
                                  visitor.cpuCores && `${visitor.cpuCores} çekirdek`,
                                  visitor.deviceMemory && `${visitor.deviceMemory} GB`,
                                  visitor.languages ?? visitor.language,
                                  visitor.clientTimezone ?? visitor.timezone,
                                ])}
                              />
                              <Detail
                                label="Protokol"
                                value={join([visitor.httpProtocol, visitor.tlsVersion])}
                              />
                              <div className="sm:col-span-2 lg:col-span-3">
                                <Detail label="User-Agent" value={visitor.userAgent ?? "—"} />
                              </div>
                            </dl>

                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  void remove(
                                    visitor.id,
                                    `${visitor.code} (${visitor.city ?? "?"})`
                                  )
                                }
                                className="-m-2 cursor-pointer p-2 text-xs uppercase tracking-[0.2em] text-brick-deep/40 transition-colors hover:text-brick"
                              >
                                Bu ziyaretçiyi sil
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>

          {report.visitors.length === 0 ? (
            <p className="py-12 text-center text-sm text-brick-deep/45">
              Bu aralıkta kayıt yok.
            </p>
          ) : null}
        </div>

        <p className="mt-10 text-xs leading-relaxed text-brick-deep/40">
          {report.hiddenBots > 0
            ? `Veri merkezlerinden gelen ${report.hiddenBots} otomatik ziyaret listeye alınmadı. `
            : ""}
          {!report.showingForeign && report.foreignCount > 0
            ? `Yurt dışından ${report.foreignCount} ziyaret gizli; üstteki düğmeyle görebilirsin. `
            : ""}
          &ldquo;~&rdquo; ile gösterilen süreler, tarayıcı ölçüm göndermediğinde sayfalar
          arası geçişten tahmin edilmiştir. Çerez kullanılmaz. Ziyaretçiler, ağ ve cihaz bilgisinden türetilen geri
          çevrilemeyen bir özet değerle tanınır; kayıtlar {report.retentionDays} gün
          sonra otomatik silinir.
          {report.totals.truncated
            ? ` Bu aralıkta ${report.totals.visits}'den fazla ziyaret var; tabloda en yenileri gösteriliyor.`
            : ""}
        </p>
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-brick-deep/15 px-6 py-6">
      <p className="text-[11px] uppercase tracking-[0.25em] text-brick-deep/45">{title}</p>
      <ul className="mt-4 flex flex-col gap-2 text-sm">{children}</ul>
    </div>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <li className="flex items-baseline justify-between gap-6 border-b border-brick-deep/10 pb-2">
      <span className="truncate">{left}</span>
      <span className="whitespace-nowrap text-brick-deep/55">{right}</span>
    </li>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.25em] text-brick-deep/40">{label}</dt>
      <dd className="mt-1 break-words leading-relaxed text-brick-deep/75">{value}</dd>
    </div>
  );
}
