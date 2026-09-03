"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";
import { pageHeroImages, projects, type ProjectId } from "../data/site";
import type { LegalKey } from "./LegalDocument";
import { T } from "./Motion";

type Crumb = { label: string; href?: string };

export type PageHeroKind = "about" | "projects" | "design" | "contact";

type PageHeroProps =
  | { page: PageHeroKind; projectId?: never; legalKey?: never }
  | { page: "project"; projectId: ProjectId; legalKey?: never }
  | { page: "legal"; legalKey: LegalKey; projectId?: never };

/** Ic sayfalarin ust bandi: gorsel, baslik ve kirinti yolu. Metinler sozlukten okunur. */
export function PageHero(props: PageHeroProps) {
  const { t } = useLanguage();
  const reduced = useReducedMotion();

  let image: string;
  let title: string;
  let crumbs: Crumb[];

  if (props.page === "project") {
    const project = projects.find((item) => item.id === props.projectId);
    const copy = t.projects.items[props.projectId];
    image = project?.cover ?? pageHeroImages.projects;
    title = copy.name;
    crumbs = [
      { label: t.projects.breadcrumb, href: "/projeler" },
      { label: copy.name },
    ];
  } else if (props.page === "about") {
    image = pageHeroImages.about;
    title = t.about.heroTitle;
    crumbs = [{ label: t.about.breadcrumb }];
  } else if (props.page === "design") {
    image = pageHeroImages.design;
    title = t.design.heroTitle;
    crumbs = [{ label: t.design.breadcrumb }];
  } else if (props.page === "legal") {
    const copy = t.legal[props.legalKey];
    image = pageHeroImages.legal;
    title = copy.title;
    crumbs = [{ label: copy.breadcrumb }];
  } else if (props.page === "contact") {
    image = pageHeroImages.contact;
    title = t.contact.heroTitle;
    crumbs = [{ label: t.contact.breadcrumb }];
  } else {
    image = pageHeroImages.projects;
    title = t.projects.title;
    crumbs = [{ label: t.projects.breadcrumb }];
  }

  return (
    <section className="relative isolate overflow-hidden bg-brick-deep">
      <Image src={image} alt="" fill sizes="100vw" priority className="object-cover" />
      <div className="absolute inset-0 bg-brick-deep/70" />
      <div className="absolute inset-0 bg-brick/20 mix-blend-multiply" />

      <div className="relative mx-auto max-w-[1600px] px-6 py-16 sm:px-10 sm:py-32">
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <T
            as="h1"
            className="max-w-4xl text-4xl font-bold uppercase leading-[1.02] tracking-tight text-bone sm:text-6xl lg:text-7xl"
          >
            {title}
          </T>

          <nav
            aria-label="breadcrumb"
            className="mt-7 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-bone/60"
          >
            <Link href="/" className="transition-colors hover:text-bone">
              <T>{t.nav.home}</T>
            </Link>
            {crumbs.map((crumb) => (
              <span key={crumb.label} className="flex items-center gap-3">
                <span className="text-bone/30">/</span>
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-bone">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-bone">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </motion.div>
      </div>
    </section>
  );
}
