"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";
import { LavaLamp } from "./LavaLamp";
import { T } from "./Motion";

export function Hero() {
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Baslik, sayfa asagi kaydikca sol ustune dogru kuculur.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.64]);

  const line = (index: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section ref={ref} className="border-b border-brick-deep/10 bg-bone">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-6 pt-6 pb-12 sm:px-10 lg:grid-cols-[1.05fr_1fr] lg:items-stretch lg:gap-16 lg:pt-10 lg:pb-20">
        <div>
          <motion.div {...line(0)}>
            <T className="block text-[11px] uppercase tracking-[0.35em] text-brick">
              {t.hero.eyebrow}
            </T>
          </motion.div>

          <div className="float-right ml-4 mb-2 h-[230px] w-[84px] sm:h-[300px] sm:w-[110px] lg:hidden">
            <LavaLamp />
          </div>

          <motion.h1
            style={
              reduced
                ? undefined
                : {
                    scale: titleScale,
                    transformOrigin: "left top",
                    // Kaydirmada her karede yeniden cizilmesin diye kendi katmanina alinir.
                    willChange: "transform",
                  }
            }
            className="mt-5 text-[3rem] font-bold uppercase leading-[1.02] tracking-tight text-brick-deep sm:text-[4.5rem] lg:text-[5.75rem]"
          >
            {[t.hero.titleLine1, t.hero.titleLine2, t.hero.titleLine3].map((text, index) => (
              <motion.span key={index} {...line(index + 1)} className="block">
                <T className={index === 2 ? "block text-brick" : "block"}>{text}</T>
              </motion.span>
            ))}
          </motion.h1>

          <motion.div {...line(4)} className="mt-10 max-w-xl">
            <T as="p" className="text-base leading-relaxed text-brick-deep/70 sm:text-lg">
              {t.hero.description}
            </T>
          </motion.div>
        </div>

        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden w-full lg:block lg:h-full lg:min-h-[620px] lg:p-6"
        >
          <LavaLamp />
        </motion.div>
      </div>
    </section>
  );
}
