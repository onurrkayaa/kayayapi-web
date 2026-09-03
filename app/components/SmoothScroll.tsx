"use client";

import { useEffect } from "react";

/** Tekerlek hareketini yumusatan sonumleme katsayisi; kucuk deger = daha uzun sure kayar. */
const EASE = 0.085;

/**
 * Fare tekerlegiyle yapilan kaydirmaya ivme kazandirir; sayfa sicramak yerine sogurulerek durur.
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

    const maxScroll = () => root.scrollHeight - window.innerHeight;

    const tick = () => {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.4) {
        current = target;
        running = false;
        window.scrollTo(0, current);
        return;
      }
      window.scrollTo(0, current);
      frame = requestAnimationFrame(tick);
    };

    const glideTo = (value: number) => {
      target = Math.min(Math.max(value, 0), maxScroll());
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
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
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
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      root.style.scrollBehavior = previousBehavior;
    };
  }, []);

  return null;
}
