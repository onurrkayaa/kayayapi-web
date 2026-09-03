"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { activeProvinceIds, cityLabels } from "../data/site";
import { Wordmark } from "./Logo";
import { T } from "./Motion";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-brick-darkest text-bone">
      <div className="mx-auto max-w-[1600px] px-6 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-10 sm:py-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Wordmark accentClassName="text-brick-light" />
            <T as="p" className="mt-4 max-w-xs text-sm leading-relaxed text-bone/55">
              {t.footer.tagline}
            </T>

            <ul className="mt-8 flex flex-col gap-3 text-sm text-bone/65">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-brick-light" strokeWidth={1.5} />
                <a href={`mailto:${t.footer.email}`} className="inline-block py-1 hover:text-bone">
                  {t.footer.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <T className="block text-[11px] uppercase tracking-[0.25em] text-bone/45">
              {t.footer.servicesTitle}
            </T>
            <ul className="mt-5 flex flex-col gap-4 text-sm text-bone/65 lg:gap-3">
              {t.services.items.map((item) => (
                <li key={item.title}>
                  <Link href="/#hizmetler" className="inline-block py-1 transition-colors hover:text-bone lg:py-0">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <T className="block text-[11px] uppercase tracking-[0.25em] text-bone/45">
              {t.footer.companyTitle}
            </T>
            <ul className="mt-5 flex flex-col gap-4 text-sm text-bone/65 lg:gap-3">
              {t.footer.company.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-block py-1 transition-colors hover:text-bone lg:py-0">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <T className="block text-[11px] uppercase tracking-[0.25em] text-bone/45">
              {t.footer.regionsTitle}
            </T>
            <ul className="mt-5 flex flex-col gap-4 text-sm text-bone/65 lg:gap-3">
              {activeProvinceIds.map((id) => (
                <li key={id}>
                  <Link href="/#bolgeler" className="inline-block py-1 transition-colors hover:text-bone lg:py-0">
                    {cityLabels[id]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-bone/15 pt-8 text-xs text-bone/40 sm:mt-16">
          <T>{t.footer.rights}</T>
          {t.footer.legal.map((item) => (
            <span key={item.href} className="flex items-center gap-4">
              <span className="text-bone/20">|</span>
              <Link
                href={item.href}
                className="inline-block py-1 underline-offset-4 transition-colors hover:text-bone/70 hover:underline lg:py-0"
              >
                {item.label}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
