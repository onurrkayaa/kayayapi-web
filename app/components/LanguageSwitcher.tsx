"use client";

import { useLanguage } from "../i18n/LanguageContext";
import type { Locale } from "../i18n/dictionary";

const LOCALES: Locale[] = ["tr", "en"];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] sm:text-sm ${className}`}
    >
      {LOCALES.map((code, index) => (
        <div key={code} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLocale(code)}
            aria-current={locale === code}
            className={`-my-3 inline-flex min-h-11 cursor-pointer items-center px-1 transition-colors ${
              locale === code
                ? "text-current"
                : "text-current/40 hover:text-current/70"
            }`}
          >
            {code.toUpperCase()}
          </button>
          {index < LOCALES.length - 1 && <span className="text-current/30">|</span>}
        </div>
      ))}
    </div>
  );
}
