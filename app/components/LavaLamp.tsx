"use client";

import type { CSSProperties } from "react";
import { useLanguage } from "../i18n/LanguageContext";

/**
 * Lav lambasi. Damlalarin kenarindaki alfa sonumu ust uste geldiklerinde
 * birlesmis gibi gostersin diye; hareket yalnizca transform uzerinden gider,
 * her karede yeniden hesaplanan filtre ya da layout ozelligi yoktur.
 *
 * Olculer lambanin genisligine gore yuzdedir: cam sabit en-boy oraninda
 * oldugu icin tek bir bilesen hem masaustunde hem telefonda ayni durur.
 * size/left cam genisliginin, bottom cam yuksekliginin,
 * rise/drift ise damlanin kendi boyunun yuzdesidir.
 */
const blobs = [
  { size: 42, left: 26, bottom: 2, rise: -420, drift: 7, duration: 26, delay: -3 },
  { size: 32, left: 52, bottom: 0, rise: -600, drift: -56, duration: 21, delay: -11 },
  { size: 20, left: 20, bottom: 4, rise: -940, drift: 100, duration: 17, delay: -6 },
  { size: 13, left: 62, bottom: 8, rise: -1400, drift: -131, duration: 14, delay: -9 },
  { size: 27, left: 34, bottom: -2, rise: -700, drift: 22, duration: 30, delay: -18 },
  { size: 36, left: 44, bottom: -4, rise: -170, drift: -12, duration: 24, delay: -13 },
];

/**
 * Lambanin cevreye vurdugu isik. Dipteki ampulun sicak cekirdegi, cam boyunca
 * sonen hale, zemine dusen yayilma ve genis ortam isigi ust uste biner.
 * Her katman kendi kenarindan once saydama indigi icin kutu sinirinda cizgi
 * olusmaz; renkler ember/brick-light/brick tonlaridir.
 */
const glow = [
  "radial-gradient(ellipse 24% 10% at 50% 86%, rgba(224,102,63,0.52), rgba(224,102,63,0) 74%)",
  "radial-gradient(ellipse 34% 30% at 50% 58%, rgba(196,82,63,0.30), rgba(196,82,63,0) 76%)",
  "radial-gradient(ellipse 46% 5% at 50% 96%, rgba(224,102,63,0.34), rgba(224,102,63,0) 78%)",
  "radial-gradient(ellipse 78% 42% at 50% 74%, rgba(139,58,47,0.16), rgba(139,58,47,0) 74%)",
].join(", ");

export function LavaLamp() {
  const { t } = useLanguage();

  return (
    <div
      role="img"
      aria-label={t.hero.lampLabel}
      className="relative flex h-full w-full items-center justify-center"
    >
      <div className="relative flex h-full max-h-[620px] flex-col aspect-[1/2.8]">
        {/* Lambanin cevreye vurdugu isik */}
        <div
          className="kaya-lava-glow pointer-events-none absolute -inset-x-[100%] -bottom-[4%] -top-[8%]"
          style={{ backgroundImage: glow }}
        />

        {/* Ust kapak */}
        <div
          className="relative mx-auto w-[47%] shrink-0 bg-[linear-gradient(90deg,var(--color-brick-darkest),var(--color-brick)_20%,var(--color-brick-ember)_40%,var(--color-brick)_62%,var(--color-brick-darkest))] aspect-[3.4/1]"
          style={{ clipPath: "polygon(7% 0, 93% 0, 100% 100%, 0 100%)" }}
        />

        {/* Cam govde */}
        <div
          className="relative w-full flex-1 overflow-hidden bg-[linear-gradient(180deg,var(--color-brick-deep),var(--color-brick-darkest))]"
          style={{ clipPath: "polygon(27% 0, 73% 0, 100% 100%, 0 100%)" }}
        >
          {/* Dipteki ampul parlamasi */}
          <div className="pointer-events-none absolute inset-x-[-10%] bottom-[-12%] h-[26%] rounded-[50%] bg-brick-ember/60 blur-xl" />

          <div className="absolute inset-0">
            {/* Dipteki lav golu; damlalar buradan kopar */}
            <div className="kaya-lava-pool absolute inset-x-[-8%] bottom-[-7%] h-[13%] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_20%,var(--color-brick-ember)_0%,var(--color-brick-light)_52%,var(--color-brick)_84%,rgba(139,58,47,0)_100%)]" />

            {blobs.map((blob, index) => (
              <div
                key={index}
                className="kaya-lava-blob absolute aspect-square rounded-full bg-[radial-gradient(circle_at_38%_28%,var(--color-brick-ember)_0%,var(--color-brick-light)_34%,var(--color-brick-light)_64%,var(--color-brick)_86%,rgba(139,58,47,0)_100%)]"
                style={
                  {
                    width: `${blob.size}%`,
                    left: `${blob.left}%`,
                    bottom: `${blob.bottom}%`,
                    animationDuration: `${blob.duration}s`,
                    animationDelay: `${blob.delay}s`,
                    "--kaya-rise": `${blob.rise}%`,
                    "--kaya-drift": `${blob.drift}%`,
                  } as CSSProperties
                }
              />
            ))}
          </div>

          {/* Cam yansimalari */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(242,236,225,0.22),rgba(242,236,225,0)_16%,rgba(242,236,225,0)_78%,rgba(242,236,225,0.14))]" />
          <div className="pointer-events-none absolute bottom-[20%] left-[30%] top-[2%] w-[5%] bg-[linear-gradient(180deg,rgba(242,236,225,0.16),rgba(242,236,225,0.02))]" />

          {/* Camin konik kenar hatti */}
          <svg
            aria-hidden
            viewBox="0 0 100 238"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <polygon
              points="27,0 73,0 100,238 0,238"
              fill="none"
              stroke="rgba(242,236,225,0.3)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Ayak */}
        <div
          className="relative mx-auto w-[64%] shrink-0 bg-[linear-gradient(90deg,var(--color-brick-darkest),var(--color-brick)_22%,var(--color-brick-ember)_42%,var(--color-brick)_64%,var(--color-brick-darkest))] aspect-[2.3/1]"
          style={{ clipPath: "polygon(24% 0, 76% 0, 100% 100%, 0 100%)" }}
        />
        <div className="mx-auto h-[3px] w-[66%] shrink-0 bg-brick-darkest" />
      </div>
    </div>
  );
}
