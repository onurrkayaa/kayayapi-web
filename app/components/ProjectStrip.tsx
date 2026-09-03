"use client";

import Image from "next/image";
import { useLanguage } from "../i18n/LanguageContext";
import { stripImages } from "../data/site";
import { Reveal } from "./Motion";

export function ProjectStrip() {
  const { t } = useLanguage();
  const items = t.strip.items;
  const loop = [...items, ...items];

  return (
    <section className="overflow-hidden border-b border-brick-deep/10 bg-bone py-10 sm:py-16">
      <Reveal className="kaya-marquee relative">
        <div className="kaya-marquee-track flex w-max gap-4 sm:gap-6">
          {loop.map((item, index) => (
            <figure
              key={`${item.name}-${index}`}
              className="group relative w-[280px] shrink-0 sm:w-[360px]"
            >
              <div className="relative aspect-4/5 overflow-hidden">
                <Image
                  src={stripImages[index % stripImages.length]}
                  alt={`${item.name} — ${item.type}`}
                  fill
                  sizes="(max-width: 640px) 280px, 360px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-brick-deep/10 transition-opacity duration-500 group-hover:opacity-0" />
              </div>
              <figcaption className="mt-4 flex items-baseline justify-between gap-4 border-t border-brick-deep/15 pt-3">
                <span className="text-sm font-medium uppercase tracking-[0.12em] text-brick-deep">
                  {item.name}
                </span>
                <span className="text-xs uppercase tracking-[0.16em] text-brick-deep/45">
                  {item.type}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
