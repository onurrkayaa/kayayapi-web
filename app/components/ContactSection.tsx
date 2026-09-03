"use client";

import { useState } from "react";
import { Mail, MapPin } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { Reveal, T } from "./Motion";

/** Alt cizgili, sade form alani — tasarim dilinde ince cizgi disinda kutu yok. */
const fieldClass =
  "w-full border-b border-brick-deep/25 bg-transparent pb-3 text-base text-brick-deep transition-colors placeholder:text-brick-deep/35 focus:border-brick focus:outline-none";

export function ContactSection() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);

  const details = [
    {
      icon: MapPin,
      label: t.contact.addressLabel,
      value: t.contact.addressValue,
      note: t.contact.addressNote,
    },
    {
      icon: Mail,
      label: t.contact.emailLabel,
      value: t.footer.email,
      href: `mailto:${t.footer.email}`,
    },
  ];

  return (
    <>
      <section className="border-b border-brick-deep/10 bg-bone">
        <div className="mx-auto max-w-[1600px] px-6 py-14 sm:px-10 sm:py-28">
          <Reveal>
            <T
              as="h2"
              className="text-4xl font-bold uppercase leading-[1.02] tracking-tight text-brick-deep sm:text-5xl"
            >
              {t.contact.detailsTitle}
            </T>
            <T as="p" className="mt-5 max-w-xl text-sm leading-relaxed text-brick-deep/60">
              {t.contact.detailsDescription}
            </T>
          </Reveal>

          <ul className="mt-10 sm:mt-14 grid gap-10 border-t border-brick-deep/15 pt-10 sm:grid-cols-2 sm:gap-8">
            {details.map((detail, index) => (
              <Reveal as="li" key={detail.label} delay={index * 0.08}>
                <detail.icon className="h-6 w-6 text-brick" strokeWidth={1.4} />
                <T className="mt-5 block text-[11px] uppercase tracking-[0.25em] text-brick-deep/45">
                  {detail.label}
                </T>
                {detail.href ? (
                  <a
                    href={detail.href}
                    className="mt-2 block text-base text-brick-deep transition-colors hover:text-brick"
                  >
                    {detail.value}
                  </a>
                ) : (
                  <span className="mt-2 block text-base text-brick-deep">{detail.value}</span>
                )}
                {detail.note && (
                  <T as="p" className="mt-2 flex items-center gap-2 text-xs text-brick">
                    {detail.note}
                  </T>
                )}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-bone-soft">
        <div className="mx-auto max-w-[1600px] px-6 py-14 sm:px-10 sm:py-28">
          <Reveal>
            <T
              as="h2"
              className="text-4xl font-bold uppercase leading-[1.02] tracking-tight text-brick-deep sm:text-5xl"
            >
              {t.contact.formTitle}
            </T>
            <T as="p" className="mt-5 text-sm leading-relaxed text-brick-deep/60">
              {t.contact.formDescription}
            </T>
          </Reveal>

          <Reveal delay={0.08}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
              }}
              className="mt-12 flex flex-col gap-10"
            >
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block">
                  <span className="sr-only">{t.contact.nameLabel}</span>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={t.contact.nameLabel}
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="sr-only">{t.contact.phoneFieldLabel}</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder={t.contact.phoneFieldLabel}
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="sr-only">{t.contact.subjectLabel}</span>
                  <input
                    type="text"
                    name="subject"
                    placeholder={t.contact.subjectLabel}
                    className={fieldClass}
                  />
                </label>
              </div>

              <label className="block">
                <span className="sr-only">{t.contact.messageLabel}</span>
                <textarea
                  name="message"
                  rows={6}
                  required
                  placeholder={t.contact.messageLabel}
                  data-native-scroll
                  className={`${fieldClass} resize-y`}
                />
              </label>

              <div className="flex flex-wrap items-center gap-6">
                <button
                  type="submit"
                  className="cursor-pointer bg-brick px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] text-bone transition-colors hover:bg-brick-deep"
                >
                  {t.contact.submit}
                </button>
                {sent && (
                  <T as="p" className="text-sm text-brick">
                    {t.contact.success}
                  </T>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
