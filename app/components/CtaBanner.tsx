"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { ctaImage } from "../data/site";
import { Reveal, T } from "./Motion";

export function CtaBanner() {
  const { t } = useLanguage();

  return (
    <section className="relative isolate overflow-hidden bg-brick-deep">
      <Image
        src={ctaImage}
        alt={t.cta.imageAlt}
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-brick-deep/70" />
      <div className="absolute inset-0 bg-brick/20 mix-blend-multiply" />

      <div className="relative mx-auto max-w-[1600px] px-6 py-16 sm:px-10 sm:py-32">
        <Reveal className="max-w-2xl">
          <T
            as="h2"
            className="text-4xl font-bold uppercase leading-[1.02] tracking-tight text-bone sm:text-6xl"
          >
            {t.cta.title}
          </T>
          <T as="p" className="mt-6 text-base leading-relaxed text-bone/70 sm:text-lg">
            {t.cta.description}
          </T>
          <Link
            href="/iletisim"
            className="group mt-10 inline-flex items-center gap-3 bg-bone px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-brick-deep transition-colors hover:bg-brick hover:text-bone"
          >
            <T>{t.cta.button}</T>
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={2}
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
