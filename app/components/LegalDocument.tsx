"use client";

import { useLanguage } from "../i18n/LanguageContext";
import { Reveal, T } from "./Motion";

export type LegalKey = "notice" | "privacy" | "kvkk";

export function LegalDocument({ doc }: { doc: LegalKey }) {
  const { t } = useLanguage();
  const copy = t.legal[doc];

  return (
    <section className="bg-bone">
      <div className="mx-auto max-w-[1600px] px-6 py-14 sm:px-10 sm:py-28">
        <div className="max-w-3xl">
          <Reveal>
            <T className="block text-[11px] uppercase tracking-[0.25em] text-brick-deep/40">
              {copy.updated}
            </T>
            <T as="p" className="mt-6 text-xl leading-relaxed text-brick-deep sm:text-2xl">
              {copy.intro}
            </T>
          </Reveal>

          <ol className="mt-12 sm:mt-16 flex flex-col gap-12">
            {copy.sections.map((section, index) => (
              <Reveal as="li" key={section.heading} delay={0.04}>
                <div className="flex items-baseline gap-4 border-t border-brick-deep/15 pt-6">
                  <span className="font-mono text-xs text-brick">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <T
                    as="h2"
                    className="text-xl font-bold uppercase tracking-tight text-brick-deep sm:text-2xl"
                  >
                    {section.heading}
                  </T>
                </div>

                <div className="mt-5 flex flex-col gap-3 pl-0 sm:pl-10">
                  {section.body.map((paragraph, line) => (
                    <T
                      key={line}
                      as="p"
                      className="text-base leading-relaxed text-brick-deep/70"
                    >
                      {paragraph}
                    </T>
                  ))}
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
