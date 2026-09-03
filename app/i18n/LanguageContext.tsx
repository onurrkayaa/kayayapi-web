"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionary, type Dictionary, type Locale } from "./dictionary";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("tr");

  // text-transform: uppercase dile gore calisir; TR'de "i" -> "İ" olur.
  // Ingilizce metinlerin dogru buyuk harfe donmesi icin html[lang] guncellenir.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, t: dictionary[locale] }),
    [locale]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
