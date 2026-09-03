"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.28em] inline-block">
      {children}
    </motion.span>
  );
}

export function Manifesto() {
  const { t, locale } = useLanguage();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.25"],
  });

  const words = t.manifesto.text.split(" ");

  return (
    <section className="border-b border-brick-deep/10 bg-bone-soft py-16 sm:py-36">
      <div ref={ref} className="mx-auto max-w-5xl px-6 sm:px-10">
        <p
          key={locale}
          className="flex flex-wrap text-2xl leading-[1.35] font-medium text-brick-deep sm:text-4xl sm:leading-[1.3]"
        >
          {reduced
            ? t.manifesto.text
            : words.map((word, index) => (
                <Word
                  key={`${locale}-${index}`}
                  progress={scrollYProgress}
                  range={[index / words.length, (index + 1.5) / words.length]}
                >
                  {word}
                </Word>
              ))}
        </p>
      </div>
    </section>
  );
}
