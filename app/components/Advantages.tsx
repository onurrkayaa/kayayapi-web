"use client";

import { useLanguage } from "../i18n/LanguageContext";
import { Reveal, T } from "./Motion";

export function Advantages() {
  const { t } = useLanguage();

  return (
    <section className="border-b border-brick-deep/10 bg-bone-soft">
      <div className="mx-auto max-w-[1600px] px-6 py-14 sm:px-10 sm:py-28">
        <Reveal>
          <T
            as="h2"
            className="max-w-3xl text-4xl font-bold uppercase leading-[1.02] tracking-tight text-brick-deep sm:text-6xl"
          >
            {t.advantages.title}
          </T>
        </Reveal>

        <ul className="mt-12 sm:mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {t.advantages.items.map((item, index) => (
            <Reveal as="li" key={item.title} delay={(index % 3) * 0.08}>
              <span className="font-mono text-xs text-brick">0{index + 1}</span>
              <T
                as="h3"
                className="mt-4 text-xl font-bold uppercase tracking-tight text-brick-deep"
              >
                {item.title}
              </T>
              <T as="p" className="mt-3 text-sm leading-relaxed text-brick-deep/65">
                {item.description}
              </T>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
