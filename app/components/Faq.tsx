"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { Reveal, T } from "./Motion";

export function Faq() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="sss" className="border-b border-brick-deep/10 bg-bone-soft">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-6 py-14 sm:px-10 sm:py-28 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <Reveal>
          <T
            as="h2"
            className="text-4xl font-bold uppercase leading-[1.02] tracking-tight text-brick-deep sm:text-6xl"
          >
            {t.faq.title}
          </T>
          <T as="p" className="mt-5 text-sm leading-relaxed text-brick-deep/60">
            {t.faq.description}
          </T>
        </Reveal>

        <Reveal delay={0.08}>
          <ul className="flex flex-col">
            {t.faq.items.map((item, index) => {
              const isOpen = open === index;
              return (
                <li key={item.question} className="border-t border-brick-deep/15 last:border-b">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-start justify-between gap-6 py-6 text-left"
                  >
                    <span className="text-lg font-medium text-brick-deep sm:text-xl">
                      {item.question}
                    </span>
                    <span className="mt-1 shrink-0 text-brick">
                      {isOpen ? (
                        <Minus className="h-5 w-5" strokeWidth={1.5} />
                      ) : (
                        <Plus className="h-5 w-5" strokeWidth={1.5} />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-7 text-sm leading-relaxed text-brick-deep/65 sm:text-base">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
