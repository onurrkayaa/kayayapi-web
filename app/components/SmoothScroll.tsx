"use client";

import { useEffect } from "react";

/** Tekerlegin kat ettigi mesafe carpani; 1'in altinda oldugu icin sayfa daha yavas iner. */
const SPEED = 0.8;
/**
 * Her karede hedefe yaklasma orani. Yuksek deger kisa bir sonumleme kuyrugu birakir:
 * 0.2'de bir tekerlek tiki ~0.3 sn'de oturur, tarayici tekrar bos kalir.
 */
const EASE = 0.2;

/**
 * Tekerlek hareketini yavaslatip yumusatir; sayfa sicramak yerine yerine oturur.
 * Dokunmatik cihazlar ve `prefers-reduced-motion` acikken devreye girmez.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Dokunmatikte tarayicinin kendi ivmesi zaten var; araya girmiyoruz.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement;
    // Kendi animasyonumuzu calistirdigimiz icin CSS smooth scroll'u kapatiyoruz.
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    let target = window.scrollY;
    let current = target;
    let running = false;
    let frame = 0;
    let limit = 0;

    /** `scrollHeight` okumak yeniden yerlesim tetikler; kare basina degil, kayis basina olculur. */
    const measure = () => {
      limit = root.scrollHeight - window.innerHeight;
    };

    const tick = () => {
      const gap = target - current;
      if (Math.abs(gap) < 0.5) {
        current = target;
        running = false;
        window.scrollTo(0, current);
        return;
      }
      current += gap * EASE;
      // Tam sayi konum, metnin her karede yeniden puslanmasini onler.
      window.scrollTo(0, Math.round(current));
      frame = requestAnimationFrame(tick);
    };

    const glideTo = (value: number) => {
      if (!running) {
        measure();
        current = window.scrollY;
      }
      target = Math.min(Math.max(value, 0), limit);
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.defaultPrevented) return;
      // Menu acikken govde kilitli; tarayiciya karismiyoruz.
      if (document.body.dataset.scrollLocked === "true") return;
      const element = event.target as Element | null;
      if (element?.closest?.("[data-native-scroll]")) return;

      event.preventDefault();
      const delta = (event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY) * SPEED;
      glideTo((running ? target : window.scrollY) + delta);
    };

    /** Ayni sayfadaki cengel baglantilarini da ayni ivmeyle goturur. */
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const link = (event.target as Element | null)?.closest?.("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;
      const hash = href.startsWith("#")
        ? href
        : href.startsWith("/#") && window.location.pathname === "/"
          ? href.slice(1)
          : null;
      if (!hash || hash === "#") return;

      const destination = document.querySelector(hash);
      if (!destination) return;

      event.preventDefault();
      glideTo(window.scrollY + destination.getBoundingClientRect().top);
      window.history.replaceState(null, "", hash);
    };

    /** Klavye, geri tusu veya baska bir kaynak sayfayi tasidiysa hedefi eslestir. */
    const onScroll = () => {
      if (!running) {
        target = window.scrollY;
        current = target;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      document.removeEventListener("click", onClick);
      root.style.scrollBehavior = previousBehavior;
    };
  }, []);

  return null;
}
