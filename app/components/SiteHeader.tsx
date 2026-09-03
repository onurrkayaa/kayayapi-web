"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Wordmark } from "./Logo";
import { T } from "./Motion";

export function SiteHeader() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    // SmoothScroll bu isareti gorunce tekerlek olayina karismaz.
    document.body.dataset.scrollLocked = open ? "true" : "false";
    return () => {
      document.body.style.overflow = "";
      document.body.dataset.scrollLocked = "false";
    };
  }, [open]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          scrolled
            ? "border-brick-deep/10 bg-bone/95"
            : "border-transparent bg-bone"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 transition-[padding] duration-500 sm:px-10 ${
            scrolled ? "py-3" : "py-5"
          }`}
        >
          <Link href="/" aria-label="Kaya Yapı">
            <Wordmark className="text-brick-deep" compact={scrolled}>
              <T className="mt-1 hidden text-[10px] uppercase tracking-[0.3em] text-brick-deep/50 sm:block">
                {t.footer.tagline}
              </T>
            </Wordmark>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {t.nav.links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative py-1 text-sm uppercase tracking-[0.16em] text-brick-deep/70 transition-colors hover:text-brick-deep"
              >
                <T key={`${link.href}-${index}`}>{link.label}</T>
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-brick transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-brick-deep sm:gap-6">
            <LanguageSwitcher />
            <Link
              href="/iletisim"
              className="hidden items-center gap-2 bg-brick px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-bone transition-colors hover:bg-brick-deep sm:inline-flex"
            >
              <T>{t.nav.contact}</T>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t.nav.menuLabel}
              className="-m-2 cursor-pointer p-2 text-brick-deep transition-opacity hover:opacity-60 lg:hidden"
            >
              <Menu className="h-7 w-7" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-brick-deep text-bone"
          >
            <div
              data-native-scroll
              className="flex h-full flex-col overflow-y-auto px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-10"
            >
              <div className="flex items-center justify-between">
                <Wordmark accentClassName="text-brick-light" compact />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t.nav.closeLabel}
                  className="-m-2 cursor-pointer p-2 transition-opacity hover:opacity-60"
                >
                  <X className="h-7 w-7" strokeWidth={1.5} />
                </button>
              </div>

              <nav className="mt-12 sm:mt-16 flex flex-col gap-6">
                {t.nav.links.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.06 * index }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="inline-block py-1 text-3xl font-bold uppercase tracking-tight transition-colors hover:text-brick-light sm:text-5xl"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-6 border-t border-bone/20 pt-6">
                <LanguageSwitcher />
                <Link
                  href="/iletisim"
                  onClick={() => setOpen(false)}
                  className="inline-flex w-fit items-center gap-2 bg-bone px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-brick-deep"
                >
                  {t.nav.contact}
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
