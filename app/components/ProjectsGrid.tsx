"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { projects } from "../data/site";
import { Reveal, T } from "./Motion";

export function ProjectsGrid() {
  const { t } = useLanguage();

  return (
    <section className="border-b border-brick-deep/10 bg-bone">
      <div className="mx-auto max-w-[1600px] px-6 py-14 sm:px-10 sm:py-28">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-brick" />
              <T className="text-[11px] uppercase tracking-[0.35em] text-brick">
                {t.projects.eyebrow}
              </T>
            </div>
            <T
              as="h2"
              className="mt-6 text-4xl font-bold uppercase leading-[1.02] tracking-tight text-brick-deep sm:text-6xl"
            >
              {t.projects.title}
            </T>
          </div>
          <T as="p" className="max-w-md text-sm leading-relaxed text-brick-deep/60">
            {t.projects.description}
          </T>
        </Reveal>

        <div className="mt-10 sm:mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2">
          {projects.map((project, index) => {
            const copy = t.projects.items[project.id];
            return (
              <Reveal key={project.id} delay={(index % 2) * 0.08}>
                <Link href={`/projeler/${project.id}`} className="group block">
                  <div className="relative aspect-4/3 overflow-hidden">
                    <Image
                      src={project.cover}
                      alt={copy.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-brick-deep/25 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <span className="absolute right-4 bottom-4 flex h-11 w-11 items-center justify-center bg-bone text-brick-deep transition-all duration-500 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                    </span>
                  </div>

                  <div className="mt-5 border-t border-brick-deep/15 pt-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                      <h3 className="text-xl font-bold uppercase tracking-tight text-brick-deep transition-colors group-hover:text-brick">
                        {copy.name}
                      </h3>
                      <span className="shrink-0 text-xs uppercase tracking-[0.16em] text-brick-deep/45">
                        {copy.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-brick-deep/60">
                      {copy.summary}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
