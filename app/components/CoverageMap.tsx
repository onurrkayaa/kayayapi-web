"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";
import {
  activeProvinceIds,
  cityLabels,
  mapViewBox,
  offices,
  provinceLabels,
  type ActiveProvinceId,
} from "../data/site";
import { provinces } from "../data/turkeyProvinces";
import { Reveal, T } from "./Motion";

/** Sarmalayicidan devralinan tek gorunurluk durumu. */
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function CoverageMap() {
  const { t } = useLanguage();
  const reduced = useReducedMotion();

  return (
    <section id="bolgeler" className="scroll-mt-24 border-b border-brick-deep/10 bg-bone">
      <div className="mx-auto max-w-[1600px] px-6 py-14 sm:px-10 sm:py-28">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-brick" />
              <T className="text-[11px] uppercase tracking-[0.35em] text-brick">
                {t.map.eyebrow}
              </T>
            </div>
            <T
              as="h2"
              className="mt-6 max-w-2xl text-4xl font-bold uppercase leading-[1.02] tracking-tight text-brick-deep sm:text-6xl"
            >
              {t.map.title}
            </T>
          </div>
          <T as="p" className="max-w-md text-sm leading-relaxed text-brick-deep/60">
            {t.map.description}
          </T>
        </Reveal>

        <div className="mt-10 grid gap-12 sm:mt-14 lg:grid-cols-[1.75fr_1fr] lg:gap-16">
          <Reveal>
            {/*
             * Gorunurluk tetigi bilerek bu HTML sarmalayicida durur: iOS Safari
             * IntersectionObserver'i SVG alt elemanlarinda guvenilir
             * calistirmadigi icin, tetik <path> uzerindeyken aktif iller
             * telefonda hic dolmuyordu. Cocuklar durumu variant ile devralir.
             */}
            <motion.div
              initial={reduced ? "visible" : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              <svg
                viewBox={mapViewBox}
                role="img"
                aria-label={t.map.title}
                className="-ml-6 w-[calc(100%+3rem)] sm:ml-0 sm:w-full"
              >
                {/* Once tum il sinirlari; aktif olanlar bunlarin uzerine boyanir. */}
                {provinces.map((province) => (
                  <path
                    key={province.id}
                    d={province.d}
                    fill="none"
                    stroke="var(--color-brick-darkest)"
                    className="[stroke-width:1.4] sm:[stroke-width:0.5]"
                    strokeLinejoin="round"
                  />
                ))}

                {/* Calisilan iller, harita ekrana girince sirayla dolar. */}
                {activeProvinceIds.map((id, index) => {
                  const province = provinces.find((item) => item.id === id);
                  if (!province) return null;

                  return (
                    <motion.path
                      key={id}
                      d={province.d}
                      fill="var(--color-brick)"
                      stroke="var(--color-brick-deep)"
                      className="[stroke-width:2.5] sm:[stroke-width:0.9]"
                      strokeLinejoin="round"
                      variants={fadeIn}
                      transition={{
                        duration: 0.55,
                        delay: 0.2 + index * 0.14,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  );
                })}

                <g className="hidden sm:block">
                  {activeProvinceIds.map((id, index) => {
                  const province = provinces.find((item) => item.id === id);
                  if (!province) return null;
                  const label = provinceLabels[id as ActiveProvinceId];
                  const labelX = label.labelX ?? province.cx;

                  return (
                    <motion.g
                      key={id}
                      variants={fadeIn}
                      transition={{ duration: 0.5, delay: 0.55 + index * 0.1 }}
                    >
                      <line
                        x1={province.cx}
                        y1={province.cy}
                        x2={province.cx}
                        y2={label.toY + 6}
                        stroke="var(--color-brick-deep)"
                        strokeWidth={1}
                      />
                      <path
                        d={`M${province.cx},${label.toY} l4,7 h-8 Z`}
                        fill="var(--color-brick-deep)"
                      />
                      <text
                        x={labelX}
                        y={label.toY - 6}
                        textAnchor={label.anchor}
                        stroke="var(--color-bone)"
                        strokeWidth={4}
                        paintOrder="stroke"
                        className="fill-brick-deep text-[13px] font-semibold uppercase tracking-[0.12em]"
                      >
                        {cityLabels[id]}
                      </text>
                    </motion.g>
                  );
                  })}
                </g>
              </svg>

              <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 sm:hidden">
                {activeProvinceIds.map((id) => (
                  <li
                    key={id}
                    className="text-[11px] font-medium uppercase tracking-[0.22em] text-brick"
                  >
                    {cityLabels[id]}
                  </li>
                ))}
              </ul>
            </motion.div>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col justify-center gap-10">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold tracking-tight text-brick">
                  {activeProvinceIds.length}
                </span>
                <T className="text-[11px] uppercase tracking-[0.25em] text-brick-deep/45">
                  {t.map.activeCountLabel}
                </T>
              </div>
            </div>

            <div>
              <T className="block text-[11px] uppercase tracking-[0.25em] text-brick-deep/45">
                {t.map.officesTitle}
              </T>
              <ul className="mt-5 flex flex-col">
                {offices.map((office) => {
                  const copy = t.map.offices[office.id];
                  return (
                    <li
                      key={office.id}
                      className="border-b border-brick-deep/12 py-4"
                    >
                      <T
                        className={`block text-[11px] font-medium uppercase tracking-[0.22em] ${
                          office.state === "open" ? "text-brick-deep/45" : "text-brick"
                        }`}
                      >
                        {copy.label}
                      </T>
                      <span className="mt-2 block text-base font-medium text-brick-deep">
                        {copy.value}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <T as="p" className="mt-5 text-xs leading-relaxed text-brick-deep/45">
                {t.map.soonNote}
              </T>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
