"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, RotateCcw } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { Reveal, T } from "./Motion";

type Message = { role: "user" | "model"; content: string };

type ErrorCode =
  | "invalid_request"
  | "forbidden"
  | "too_large"
  | "rate_limited"
  | "unavailable"
  | "network"
  | "turnstile";

const ERROR_CODES: ErrorCode[] = [
  "invalid_request",
  "forbidden",
  "too_large",
  "rate_limited",
  "unavailable",
  "network",
  "turnstile",
];

function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === "string" && (ERROR_CODES as string[]).includes(value);
}

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Alt cizgili sade girdi — ContactSection ile ayni tasarim dili. */
const inputClass =
  "w-full border-b border-brick-deep/25 bg-transparent pb-3 text-base text-brick-deep transition-colors placeholder:text-brick-deep/35 focus:border-brick focus:outline-none disabled:opacity-50";

export function AskAssistant() {
  const { t, locale } = useLanguage();
  const reduced = useReducedMotion();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorCode | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const widgetHostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const pendingTokenRef = useRef<string | null>(null);
  const resolveTokenRef = useRef<((token: string | null) => void) | null>(null);

  // Yeni mesaj geldikce liste dibe kayar.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  /** Turnstile betigi yuklendiginde gorunmez widget'i kurar. */
  const renderWidget = useCallback(() => {
    const turnstile = window.turnstile;
    const host = widgetHostRef.current;
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!turnstile || !host || !sitekey || widgetIdRef.current) return;

    widgetIdRef.current = turnstile.render(host, {
      sitekey,
      // Gorunmez mod: yalnizca supheli durumda kullaniciya soru sorulur.
      execution: "execute",
      appearance: "interaction-only",
      callback: (token: string) => {
        const resolve = resolveTokenRef.current;
        resolveTokenRef.current = null;
        if (resolve) resolve(token);
        else pendingTokenRef.current = token;
      },
      "error-callback": () => {
        const resolve = resolveTokenRef.current;
        resolveTokenRef.current = null;
        if (resolve) resolve(null);
      },
      "expired-callback": () => {
        pendingTokenRef.current = null;
      },
    });
  }, []);

  /** Her gonderimden once taze bir token uretir. */
  const requestToken = useCallback((): Promise<string | null> => {
    const turnstile = window.turnstile;
    const widgetId = widgetIdRef.current;
    if (!turnstile || !widgetId) return Promise.resolve(null);

    const ready = pendingTokenRef.current;
    if (ready) {
      pendingTokenRef.current = null;
      return Promise.resolve(ready);
    }

    return new Promise<string | null>((resolve) => {
      resolveTokenRef.current = resolve;
      turnstile.execute(widgetId);
      // Turnstile hic yanit vermezse istek sonsuza kadar beklemesin.
      window.setTimeout(() => {
        if (resolveTokenRef.current === resolve) {
          resolveTokenRef.current = null;
          resolve(null);
        }
      }, 10_000);
    });
  }, []);

  const send = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || busy) return;

      setError(null);
      setInput("");
      const history: Message[] = [...messages, { role: "user", content: trimmed }];
      setMessages(history);
      setBusy(true);

      const token = await requestToken();
      if (!token) {
        setError("turnstile");
        setBusy(false);
        return;
      }

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history, locale, turnstileToken: token }),
        });

        if (!response.ok || !response.body) {
          const payload = (await response
            .json()
            .catch(() => null)) as { error?: unknown } | null;
          setError(isErrorCode(payload?.error) ? payload.error : "unavailable");
          return;
        }

        setMessages((current) => [...current, { role: "model", content: "" }]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let received = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          if (!text) continue;
          received += text;
          setMessages((current) => {
            const next = [...current];
            const last = next[next.length - 1];
            next[next.length - 1] = { ...last, content: last.content + text };
            return next;
          });
        }

        // Akis acildi ama tek karakter gelmediyse cevap uretilememis demektir.
        if (received.length === 0) {
          setMessages((current) => current.slice(0, -1));
          setError("unavailable");
        }
      } catch {
        setError("network");
      } finally {
        setBusy(false);
        const turnstile = window.turnstile;
        const widgetId = widgetIdRef.current;
        // Token tek kullanimlik; bir sonraki mesaj icin widget sifirlanir.
        if (turnstile && widgetId) turnstile.reset(widgetId);
      }
    },
    [busy, locale, messages, requestToken]
  );

  const isEmpty = messages.length === 0;

  return (
    <section
      id="asistan"
      className="scroll-mt-24 border-b border-brick-deep/10 bg-bone-soft"
    >
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />

      <div className="mx-auto grid max-w-[1600px] gap-12 px-6 py-14 sm:px-10 sm:py-28 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-brick" />
            <T className="text-[11px] uppercase tracking-[0.35em] text-brick">
              {t.assistant.eyebrow}
            </T>
          </div>
          <T
            as="h2"
            className="mt-6 text-4xl font-bold uppercase leading-[1.02] tracking-tight text-brick-deep sm:text-6xl"
          >
            {t.assistant.title}
          </T>
          <T as="p" className="mt-5 text-sm leading-relaxed text-brick-deep/60">
            {t.assistant.description}
          </T>
          <T as="p" className="mt-8 text-xs leading-relaxed text-brick-deep/40">
            {t.assistant.privacyNote}
          </T>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="flex min-h-[420px] flex-col border border-brick-deep/15 bg-bone">
            <div
              ref={listRef}
              data-native-scroll
              role="log"
              aria-live="polite"
              className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8"
            >
              {isEmpty ? (
                <div>
                  <T as="p" className="text-sm text-brick-deep/45">
                    {t.assistant.emptyHint}
                  </T>
                  <ul className="mt-6 flex flex-col gap-2">
                    {t.assistant.suggestions.map((suggestion) => (
                      <li key={suggestion}>
                        <button
                          type="button"
                          onClick={() => void send(suggestion)}
                          className="cursor-pointer border border-brick-deep/20 px-4 py-2 text-left text-sm text-brick-deep/75 transition-colors hover:border-brick hover:text-brick"
                        >
                          {suggestion}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <ul className="flex flex-col gap-5">
                  {messages.map((message, index) => (
                    <motion.li
                      key={`${index}-${message.role}`}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className={
                        message.role === "user"
                          ? "flex justify-end"
                          : "flex justify-start"
                      }
                    >
                      <p
                        className={
                          message.role === "user"
                            ? "max-w-[85%] bg-brick px-4 py-3 text-sm leading-relaxed text-bone"
                            : "max-w-[92%] whitespace-pre-wrap text-sm leading-relaxed text-brick-deep/80"
                        }
                      >
                        {message.content}
                        {busy &&
                        message.role === "model" &&
                        index === messages.length - 1 ? (
                          <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-brick" />
                        ) : null}
                      </p>
                    </motion.li>
                  ))}
                </ul>
              )}

              {busy && messages[messages.length - 1]?.role === "user" ? (
                <T as="p" className="mt-5 text-xs text-brick-deep/40">
                  {t.assistant.thinking}
                </T>
              ) : null}

              <AnimatePresence>
                {error ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-5 border-l-2 border-brick pl-4 text-sm leading-relaxed text-brick"
                  >
                    {t.assistant.errors[error]}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void send(input);
              }}
              className="flex items-end gap-4 border-t border-brick-deep/15 px-5 py-5 sm:px-8"
            >
              <label className="flex-1">
                <span className="sr-only">{t.assistant.placeholder}</span>
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={t.assistant.placeholder}
                  maxLength={1000}
                  disabled={busy}
                  className={inputClass}
                />
              </label>

              {!isEmpty ? (
                <button
                  type="button"
                  onClick={() => {
                    setMessages([]);
                    setError(null);
                  }}
                  aria-label={t.assistant.clearLabel}
                  title={t.assistant.clearLabel}
                  className="cursor-pointer pb-2 text-brick-deep/40 transition-colors hover:text-brick"
                >
                  <RotateCcw className="h-5 w-5" strokeWidth={1.5} />
                </button>
              ) : null}

              <button
                type="submit"
                disabled={busy || input.trim().length === 0}
                aria-label={t.assistant.sendLabel}
                className="cursor-pointer pb-2 text-brick transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowUp className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </form>
          </div>

          {/* Gorunmez Turnstile widget'i; yalnizca supheli durumda gorunur olur. */}
          <div ref={widgetHostRef} className="mt-4" />
        </Reveal>
      </div>
    </section>
  );
}
