"use client";

import Image from "next/image";
import { useLanguage } from "../i18n/LanguageContext";
import { serviceImages } from "../data/site";
import { Reveal, T } from "./Motion";

export function Services() {
  const { t } = useLanguage();

  return (
    <section id="hizmetler" className="scroll-mt-24 border-b border-brick-deep/10 bg-bone">
      <div className="mx-auto max-w-[1600px] px-6 py-14 sm:px-10 sm:py-28">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-brick" />
              <T className="text-[11px] uppercase tracking-[0.35em] text-brick">
                {t.services.eyebrow}
              </T>
            </div>
            <T
              as="h2"
              className="mt-6 text-4xl font-bold uppercase leading-[1.02] tracking-tight text-brick-deep sm:text-6xl"
            >
              {t.services.title}
            </T>
          </div>
        </Reveal>

        <div className="mt-10 sm:mt-14 flex flex-col">
          {t.services.items.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.05}>
              <article className="group grid items-center gap-6 border-t border-brick-deep/15 py-8 lg:grid-cols-[auto_1.1fr_1.4fr_auto] lg:gap-10 lg:py-10">
                <span className="font-mono text-xs text-brick-deep/35">
                  0{index + 1}
                </span>

                <T
                  as="h3"
                  className="text-2xl font-bold uppercase leading-tight tracking-tight text-brick-deep transition-colors group-hover:text-brick sm:text-3xl"
                >
                  {item.title}
                </T>

                <T as="p" className="text-sm leading-relaxed text-brick-deep/65 sm:text-base">
                  {item.description}
                </T>

                <div className="relative h-44 w-full overflow-hidden lg:h-32 lg:w-52">
                  <Image
                    src={serviceImages[index % serviceImages.length]}
                    alt={item.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 208px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-brick/15 mix-blend-multiply" />
                </div>
              </article>
            </Reveal>
          ))}
          <div className="border-t border-brick-deep/15" />
        </div>
      </div>
    </section>
  );
}
