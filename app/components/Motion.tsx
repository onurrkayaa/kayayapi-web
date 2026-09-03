"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useLanguage } from "../i18n/LanguageContext";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "span" | "p" | "h2" | "h3";
};

/**
 * Gorunur olunca bir kez calisan, yukselerek yerine oturma.
 * Negatif alt `margin`, blogun ekrana bir miktar girmesini bekler; boylece animasyon
 * kullanici oraya varmadan bitmis olmaz, bolum gozunun onunde yerlesir.
 */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 44 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}

type TProps = {
  children: ReactNode;
  className?: string;
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3";
};

/** Dil degisiminde sayfa yenilenmeden fade gecisi yapan metin sarmalayici. */
export function T({ children, className, as = "span" }: TProps) {
  const { locale } = useLanguage();
  const Component = motion[as];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Component
        key={locale}
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {children}
      </Component>
    </AnimatePresence>
  );
}
