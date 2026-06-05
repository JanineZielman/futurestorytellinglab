"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type LanguageSwitcherProps = {
  currentLocale: string;
  supportedLocales: string[];
  cookieName: string;
};

const LOCALE_LABELS: Record<string, string> = {
  "en-gb": "EN",
  "en-us": "EN",
  "nl-nl": "NL",
  fr: "FR",
  de: "DE",
  es: "ES",
  it: "IT",
};

function getLocaleLabel(locale: string) {
  return LOCALE_LABELS[locale] ?? locale.split("-")[0].toUpperCase();
}

export default function LanguageSwitcher({
  currentLocale,
  supportedLocales,
  cookieName,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resolveLocale = (value?: string | null) => {
    if (!value) return undefined;
    const normalized = value.toLowerCase();

    if (supportedLocales.includes(normalized)) {
      return normalized;
    }

    return supportedLocales.find((locale) => locale.startsWith(`${normalized}-`));
  };

  const activeLocale =
    resolveLocale(searchParams?.get("lang")) ??
    resolveLocale(currentLocale) ??
    supportedLocales[0];

  return (
    <div className="language-switcher" role="group" aria-label="Language switcher">
      {supportedLocales.map((locale) => {
        const params = new URLSearchParams(searchParams?.toString());
        params.set("lang", locale);

        const href = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
        const isActive = locale === activeLocale;

        return (
          <Link
            key={locale}
            href={href}
            className={`language-switcher-link${isActive ? " active" : ""}`}
            hrefLang={locale}
            lang={locale}
            onClick={() => {
              document.cookie = `${cookieName}=${locale}; path=/; max-age=31536000; samesite=lax`;
            }}
          >
            {getLocaleLabel(locale)}
          </Link>
        );
      })}
    </div>
  );
}
