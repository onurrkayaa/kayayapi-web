"use client";

import Image from "next/image";
import { useLanguage } from "../i18n/LanguageContext";
import { serviceImages } from "../data/site";
import { Reveal, T } from "./Motion";

export function AboutSection() {
  const { t } = useLanguage();

  return (
    <>
      <section className="border-b border-brick-deep/10 bg-bone">
        <div className="mx-auto grid max-w-[1600px] gap-12 px-6 py-14 sm:px-10 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal>
            <T className="block text-[11px] uppercase tracking-[0.35em] text-brick">
              {t.about.eyebrow}
            </T>
            <T
              as="h2"
              className="mt-6 text-4xl font-bold uppercase leading-[1.02] tracking-tight text-brick-deep sm:text-5xl"
            >
              {t.about.title}
            </T>
          </Reveal>

          <Reveal delay={0.08} className="flex flex-col gap-6">
            {t.about.paragraphs.map((paragraph, index) => (
              <T key={index} as="p" className="text-base leading-relaxed text-brick-deep/70 sm:text-lg">
                {paragraph}
              </T>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="border-b border-brick-deep/10 bg-bone-soft">
        <div className="mx-auto max-w-[1600px] px-6 py-14 sm:px-10 sm:py-28">
          <Reveal className="flex items-center gap-4">
            <span className="h-px w-10 bg-brick" />
            <T className="text-[11px] uppercase tracking-[0.35em] text-brick-deep/50">
              {t.about.valuesTitle}
            </T>
          </Reveal>

          <ul className="mt-10 grid sm:mt-12 gap-x-10 gap-y-12 sm:grid-cols-3">
            {t.about.values.map((value, index) => (
              <Reveal as="li" key={value.title} delay={index * 0.08}>
                <div className="relative aspect-4/3 w-full overflow-hidden">
                  <Image
                    src={serviceImages[index]}
                    alt={value.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-brick/15 mix-blend-multiply" />
                </div>
                <span className="mt-5 block font-mono text-xs text-brick">0{index + 1}</span>
                <T as="h3" className="mt-3 text-xl font-bold uppercase tracking-tight text-brick-deep">
                  {value.title}
                </T>
                <T as="p" className="mt-3 text-sm leading-relaxed text-brick-deep/65">
                  {value.description}
                </T>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
