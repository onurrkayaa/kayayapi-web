"use client";

import Image from "next/image";
import { useLanguage } from "../i18n/LanguageContext";
import { designStepImages } from "../data/site";
import { Reveal, T } from "./Motion";

export function DesignSteps() {
  const { t } = useLanguage();

  return (
    <section className="border-b border-brick-deep/10 bg-bone">
      <div className="mx-auto max-w-[1600px] px-6 py-14 sm:px-10 sm:py-28">
        <Reveal className="max-w-2xl">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-brick" />
            <T className="text-[11px] uppercase tracking-[0.35em] text-brick">
              {t.design.eyebrow}
            </T>
          </div>
          <T
            as="h2"
            className="mt-6 text-4xl font-bold uppercase leading-[1.02] tracking-tight text-brick-deep sm:text-5xl"
          >
            {t.design.title}
          </T>
          <T as="p" className="mt-5 text-base leading-relaxed text-brick-deep/65">
            {t.design.description}
          </T>
        </Reveal>

        <ol className="mt-12 sm:mt-16 flex flex-col gap-16 sm:gap-24">
          {t.design.steps.map((step, index) => (
            <Reveal as="li" key={step.title} delay={0.04}>
              <div
                className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${
                  index % 2 === 1 ? "lg:[&>figure]:order-2" : ""
                }`}
              >
                <figure className="relative aspect-4/3 w-full overflow-hidden">
                  <Image
                    src={designStepImages[index]}
                    alt={step.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-brick/15 mix-blend-multiply" />
                </figure>

                <div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-bold tracking-tight text-brick-deep/15 sm:text-6xl">
                      0{index + 1}
                    </span>
                    <T className="text-[11px] uppercase tracking-[0.25em] text-brick">
                      {step.title}
                    </T>
                  </div>
                  <T
                    as="h3"
                    className="mt-6 text-3xl font-bold uppercase tracking-tight text-brick-deep sm:text-4xl"
                  >
                    {step.title}
                  </T>
                  <T as="p" className="mt-5 max-w-xl text-base leading-relaxed text-brick-deep/65">
                    {step.description}
                  </T>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
