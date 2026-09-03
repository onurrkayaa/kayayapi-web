"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { projects, type ProjectId } from "../data/site";
import { Reveal, T } from "./Motion";

export function ProjectDetail({ id }: { id: ProjectId }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);

  const project = projects.find((item) => item.id === id)!;
  const copy = t.projects.items[id];

  const position = projects.findIndex((item) => item.id === id);
  const next = projects[(position + 1) % projects.length];
  const nextCopy = t.projects.items[next.id];

  const meta = [
    { label: t.projects.detailScopeLabel, value: copy.scope },
    { label: t.projects.detailStatusLabel, value: copy.status },
    { label: t.projects.detailScaleLabel, value: copy.scale },
  ];

  return (
    <>
      <section className="border-b border-brick-deep/10 bg-bone">
        <div className="mx-auto max-w-[1600px] px-6 py-12 sm:px-10 sm:py-20">
          <Reveal>
            <div className="grid gap-8 border-b border-brick-deep/15 pb-10 sm:grid-cols-3">
              {meta.map((item) => (
                <div key={item.label}>
                  <T as="div" className="text-[10px] uppercase tracking-[0.25em] text-brick-deep/40">
                    {item.label}
                  </T>
                  <p className="mt-2 text-base font-medium text-brick-deep">{item.value}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="mt-10 grid sm:mt-12 gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            <Reveal>
              <T
                as="p"
                className="text-2xl leading-[1.3] font-medium text-brick-deep sm:text-3xl"
              >
                {copy.intro}
              </T>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="flex flex-col gap-6">
                {copy.body.map((paragraph, index) => (
                  <T
                    key={index}
                    as="p"
                    className="text-base leading-relaxed text-brick-deep/70"
                  >
                    {paragraph}
                  </T>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-b border-brick-deep/10 bg-bone-soft">
        <div className="mx-auto max-w-[1600px] px-6 py-14 sm:px-10 sm:py-24">
          <Reveal className="flex items-center gap-4">
            <span className="h-px w-10 bg-brick" />
            <T className="text-[11px] uppercase tracking-[0.35em] text-brick-deep/50">
              {t.projects.galleryTitle}
            </T>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="relative mt-8 aspect-4/3 w-full overflow-hidden sm:aspect-16/9">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={project.gallery[active]}
                    alt={`${copy.name} — ${copy.views[active]}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1400px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-brick/10 mix-blend-multiply" />
                </motion.div>
              </AnimatePresence>

              <span className="absolute bottom-0 left-0 bg-bone px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-brick-deep sm:px-5 sm:py-3 sm:text-[11px]">
                {copy.views[active]}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {project.gallery.map((image, index) => (
                <li key={image}>
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    aria-current={index === active}
                    className="group block w-full cursor-pointer text-left"
                  >
                    <span
                      className={`relative block aspect-4/3 overflow-hidden transition-opacity duration-300 ${
                        index === active ? "opacity-100" : "opacity-55 hover:opacity-85"
                      }`}
                    >
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </span>
                    <span
                      className={`mt-2.5 block border-t pt-2 text-[11px] uppercase tracking-[0.16em] transition-colors ${
                        index === active
                          ? "border-brick text-brick-deep"
                          : "border-brick-deep/15 text-brick-deep/45"
                      }`}
                    >
                      {copy.views[index]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="bg-bone">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <Link
            href="/projeler"
            className="group inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-brick-deep/60 transition-colors hover:text-brick-deep"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              strokeWidth={2}
            />
            <T>{t.projects.backToProjects}</T>
          </Link>

          <Link
            href={`/projeler/${next.id}`}
            className="group inline-flex items-center gap-4 text-left sm:text-right"
          >
            <span>
              <T className="block text-[10px] uppercase tracking-[0.25em] text-brick-deep/40">
                {t.projects.nextProject}
              </T>
              <span className="mt-1 block text-lg font-bold uppercase tracking-tight text-brick-deep transition-colors group-hover:text-brick">
                {nextCopy.name}
              </span>
            </span>
            <ArrowUpRight
              className="h-5 w-5 text-brick transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={2}
            />
          </Link>
        </div>
      </section>
    </>
  );
}
