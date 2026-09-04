"use client";

/**
 * Cerezsiz olcum istemcisi.
 *
 * Tarayiciya cerez veya localStorage yazmaz; tuttugu her sey bu bilesenin
 * bellegindedir. Sayfa acilisinda bir "view", ardindan dakikada bir ve
 * sayfadan ayrilirken gecen aktif sureyi ve kaydirma derinligini tasiyan
 * "ping" gonderir.
 *
 * Kural: olcum sayfanin calismasini hicbir kosulda etkilemez. Butun is
 * korumali bir blokta durur ve yalnizca her tarayicida bulunan API'ler
 * kullanilir.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Olcum uc noktasi. Adi bilerek notr: "track" gibi adlar reklam ve izleme
 * engelleyicilerinin hazir listelerinde gecer ve istek daha yola cikmadan
 * dusurulur.
 */
const ENDPOINT = "/api/olcum";

/** Sekme goruntulenmiyorken gecen sure oturum suresine sayilmaz. */
const PING_INTERVAL_MS = 60_000;

/**
 * Kaydirma orneklemesi arasindaki en kisa sure. Kare basina yerlesim okumak
 * yasak oldugu icin dinleyici bu araliga kisilir.
 */
const SCROLL_SAMPLE_MS = 500;

type ViewState = {
  key: string;
  accumulated: number;
  since: number | null;
  scroll: number;
  sampledAt: number;
};

/**
 * Bu goruntuleme icin tek kullanimlik anahtar.
 *
 * Bilerek `crypto.randomUUID` KULLANILMAZ: Instagram'in uygulama ici tarayicisi
 * ve iOS 15.4 oncesi Safari bu islevi tanimaz; cagrildiginda sayfa cokuyordu.
 * Anahtarin kriptografik olmasi gerekmiyor, yalnizca ayni oturumdaki iki
 * goruntulemeyi ayirmaya yariyor.
 */
function newViewKey(): string {
  const chunk = () => Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${chunk()}${chunk()}`;
}

/** Ilk goruntulemede disaridan gelen adres; sonraki gezinmelerde gonderilmez. */
function externalReferrer(): string | null {
  const value = document.referrer;
  if (!value) return null;
  try {
    if (new URL(value).host === window.location.host) return null;
  } catch {
    return null;
  }
  return value;
}

function campaign(): { source?: string; medium?: string; campaign?: string } {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  const source = params.get("utm_source");
  const medium = params.get("utm_medium");
  const name = params.get("utm_campaign");
  if (source) utm.source = source;
  if (medium) utm.medium = medium;
  if (name) utm.campaign = name;
  return utm;
}

/** Tarayicinin kendi bildirdigi cihaz ayrintilari; hicbiri kalici degildir. */
function device(): Record<string, unknown> {
  try {
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string };
      deviceMemory?: number;
    };
    let timezone: string | null = null;
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
    } catch {
      timezone = null;
    }
    return {
      screen: { width: window.screen.width, height: window.screen.height },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      pixelRatio: window.devicePixelRatio,
      language: navigator.language,
      languages: navigator.languages?.slice(0, 4).join(", "),
      timezone,
      connection: nav.connection?.effectiveType,
      deviceMemory: nav.deviceMemory,
      cpuCores: navigator.hardwareConcurrency,
      touch: navigator.maxTouchPoints > 0,
    };
  } catch {
    // Bir ayrinti okunamazsa alanlar bos gecer; olcum yine calisir.
    return {};
  }
}

/**
 * `keepalive` her tarayicida yok (iOS Safari 16.4 oncesi). Desteklenmiyorsa
 * secenek hic gonderilmez; aksi halde istek sessizce basarisiz olabiliyor.
 */
function supportsKeepalive(): boolean {
  try {
    return "keepalive" in new Request(ENDPOINT);
  } catch {
    return false;
  }
}

/** fetch calismazsa devreye giren yedekler. */
function sendFallback(body: string): void {
  try {
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }
  } catch {
    // sendBeacon yoksa ya da kuyruk doluysa XHR'a dusulur
  }
  try {
    const request = new XMLHttpRequest();
    request.open("POST", ENDPOINT, true);
    request.setRequestHeader("content-type", "application/json");
    request.send(body);
  } catch {
    // Olcum gonderilemedi; ziyaretci bundan etkilenmez.
  }
}

/**
 * Olayi sunucuya iletir. Uc katman: once fetch, sayfa kapanirken sendBeacon,
 * ikisi de olmazsa XMLHttpRequest. Boylece uygulama ici tarayicilar ve eski
 * iOS surumleri de olcume dahil olur.
 */
function send(payload: Record<string, unknown>, unloading = false): void {
  const body = JSON.stringify(payload);

  // Sayfa kapanirken en guvenilir yol sendBeacon'dur: tarayici istegi
  // dokuman olsa bile teslim etmeyi ustlenir.
  if (unloading) {
    try {
      if (typeof navigator.sendBeacon === "function") {
        const blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      }
    } catch {
      // asagidaki fetch denenir
    }
  }

  try {
    const init: RequestInit = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    };
    // keepalive YALNIZCA sayfa kapanirken kullanilir. Bazi mobil tarayicilar
    // bu secenekli istegi sessizce dusuruyor; sayfa acikken buna gerek yok.
    if (unloading && supportsKeepalive()) init.keepalive = true;
    void fetch(ENDPOINT, init).catch(() => sendFallback(body));
  } catch {
    sendFallback(body);
  }
}

/** Tek sayfa gosteriminde gonderilecek en fazla etkilesim sayisi. */
const MAX_EVENTS = 25;

/** Tiklanan ogeye okunur bir ad verir. */
function elementLabel(element: Element): string | null {
  const aria = element.getAttribute("aria-label");
  const text = (aria ?? element.textContent ?? "").replace(/\s+/g, " ").trim();

  if (element instanceof HTMLAnchorElement) {
    const href = element.getAttribute("href") ?? "";
    if (href.startsWith("mailto:")) return `E-posta: ${href.slice(7)}`;
    if (href.startsWith("tel:")) return `Telefon: ${href.slice(4)}`;
    if (text) return `Bağlantı: ${text.slice(0, 60)}`;
    return href ? `Bağlantı: ${href.slice(0, 60)}` : null;
  }
  return text ? `Buton: ${text.slice(0, 60)}` : null;
}

/** Form alanini adiyla ya da etiketiyle tanimlar. */
function fieldLabel(element: Element): string | null {
  const field = element as HTMLInputElement;
  const name = field.name || field.id || field.getAttribute("placeholder");
  return name ? `Form alanı: ${name.slice(0, 60)}` : null;
}

/** Bir sayfa goruntulemesini olcer; temizleyicisini dondurur. */
function track(pathname: string, first: boolean): () => void {
  const view: ViewState = {
    key: newViewKey(),
    accumulated: 0,
    since: Date.now(),
    scroll: 0,
    sampledAt: 0,
  };

  const elapsed = () =>
    view.accumulated + (view.since === null ? 0 : Date.now() - view.since);

  /** Sayfanin ne kadarinin goruldugunu yuzde olarak gunceller. */
  const sampleScroll = () => {
    try {
      const height = document.documentElement.scrollHeight;
      if (height <= 0) return;
      const seen = ((window.scrollY + window.innerHeight) / height) * 100;
      view.scroll = Math.max(view.scroll, Math.min(100, Math.round(seen)));
    } catch {
      // kaydirma okunamadi; sure olcumu etkilenmez
    }
  };

  const onScroll = () => {
    const now = Date.now();
    if (now - view.sampledAt < SCROLL_SAMPLE_MS) return;
    view.sampledAt = now;
    sampleScroll();
  };

  const ping = (unloading = false) => {
    sampleScroll();
    send(
      {
        type: "ping",
        viewKey: view.key,
        path: pathname,
        durationMs: elapsed(),
        scroll: view.scroll,
      },
      unloading
    );
  };

  send({
    type: "view",
    viewKey: view.key,
    path: pathname,
    ...device(),
    ...(first ? { referrer: externalReferrer(), utm: campaign() } : {}),
  });

  const timer = window.setInterval(() => {
    if (view.since !== null) ping();
  }, PING_INTERVAL_MS);

  /** Sayaci durdurur: gizlenen sekmede gecen sure sayilmaz. */
  const pause = () => {
    if (view.since !== null) {
      view.accumulated += Date.now() - view.since;
      view.since = null;
    }
    ping(true);
  };

  const onVisibility = () => {
    if (document.visibilityState === "hidden") pause();
    else if (view.since === null) view.since = Date.now();
  };

  // ---- Etkilesimler: tiklanan baglantilar, dokunulan form alanlari ----

  let eventCount = 0;
  const seenFields = new Set<string>();

  const report = (kind: string, label: string) => {
    if (eventCount >= MAX_EVENTS) return;
    eventCount += 1;
    send({ type: "event", kind, label, viewKey: view.key, path: pathname });
  };

  const onClick = (nativeEvent: Event) => {
    try {
      const target = nativeEvent.target;
      if (!(target instanceof Element)) return;
      const element = target.closest("a, button");
      if (!element) return;
      const label = elementLabel(element);
      if (label) report("tiklama", label);
    } catch {
      // Olcum tiklamanin kendisini asla engellemez.
    }
  };

  const onFocus = (nativeEvent: Event) => {
    try {
      const target = nativeEvent.target;
      if (!(target instanceof Element)) return;
      if (!target.matches("input, textarea, select")) return;
      const label = fieldLabel(target);
      if (!label || seenFields.has(label)) return;
      seenFields.add(label);
      report("form", label);
    } catch {
      // yoksay
    }
  };

  const onSubmit = () => {
    try {
      report("gonderim", "Form gönderildi");
    } catch {
      // yoksay
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", pause);
  document.addEventListener("click", onClick, true);
  document.addEventListener("focusin", onFocus, true);
  document.addEventListener("submit", onSubmit, true);

  return () => {
    window.clearInterval(timer);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", pause);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("focusin", onFocus, true);
    document.removeEventListener("submit", onSubmit, true);
    // Sayfa degisiyor: son sureyi yaz.
    ping();
  };
}

export function Analytics() {
  const pathname = usePathname();
  const firstViewRef = useRef(true);

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    try {
      cleanup = track(pathname, firstViewRef.current);
      firstViewRef.current = false;
    } catch {
      // Olcum kurulamadi; sayfa normal calismaya devam eder.
    }
    return () => {
      try {
        cleanup?.();
      } catch {
        // temizlik basarisiz olsa da gezinme etkilenmez
      }
    };
  }, [pathname]);

  return null;
}
