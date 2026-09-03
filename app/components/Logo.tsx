import type { ReactNode } from "react";

/**
 * Kaya Yapi markasi: uc yuzeyli, asimetrik bir kaya siluetı.
 * Tek renkle (currentColor) calisir; yuzeyler yalnizca opaklikla ayrilir,
 * boylece hem kirik beyaz hem koyu zeminde ayni sekilde okunur.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={className}
    >
      {/* Isik alan ust sol yuzey */}
      <path d="M11 2 5.5 7 2 15.5 12.5 13Z" opacity="0.42" />
      {/* Ust sag yuzey */}
      <path d="M11 2 22 5.5 26 15 12.5 13Z" opacity="0.74" />
      {/* Govde */}
      <path d="M2 15.5 12.5 13 26 15 19.5 25.5 6 25Z" />
    </svg>
  );
}

/** Isaret + kelime markasi. `children` alt satira (slogan) yer acar. */
export function Wordmark({
  className = "",
  accentClassName = "text-brick",
  compact = false,
  children,
}: {
  className?: string;
  accentClassName?: string;
  /** Sayfa kaydirildiginda basligin kuculdugu hal. */
  compact?: boolean;
  children?: ReactNode;
}) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <LogoMark
        className={`shrink-0 transition-all duration-500 ${accentClassName} ${
          compact ? "h-6 w-6 sm:h-7 sm:w-7" : "h-7 w-7 sm:h-9 sm:w-9"
        }`}
      />
      <span className="flex flex-col leading-none">
        <span
          className={`font-bold uppercase tracking-[0.18em] transition-all duration-500 ${
            compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
          }`}
        >
          Kaya<span className={accentClassName}> Yapı</span>
        </span>
        {children}
      </span>
    </span>
  );
}
