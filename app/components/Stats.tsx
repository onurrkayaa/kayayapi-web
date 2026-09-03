"use client";

import { useLanguage } from "../i18n/LanguageContext";
import { Reveal, T } from "./Motion";

export function Stats() {
  const { t } = useLanguage();

  return (
    <section className="bg-brick-deep py-12 text-bone sm:py-20">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <Reveal>
          <T className="block text-center text-[11px] uppercase tracking-[0.35em] text-bone/50">
            {t.stats.label}
          </T>
        </Reveal>

        <dl className="mt-10 grid sm:mt-12 grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {t.stats.items.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.08}>
              <div className="border-t border-bone/20 pt-5">
                <dt className="sr-only">{item.label}</dt>
                <dd>
                  <T className="block text-4xl font-bold tracking-tight text-bone sm:text-6xl">
                    {item.value}
                  </T>
                  <T className="mt-3 block text-xs uppercase tracking-[0.18em] text-bone/50">
                    {item.label}
                  </T>
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
