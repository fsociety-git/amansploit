import en from "@/locales/shield/en.json";
import hi from "@/locales/shield/hi.json";

export const LOCALES = ["en", "hi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

const DICTS: Record<Locale, unknown> = { en, hi };

export function isLocale(v: string | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

/**
 * Deliberately not next-intl or react-i18next.
 *
 * Every string lives in locales/*.json, which is the requirement that actually
 * matters — adding Marathi or Tamil means adding a file, nothing else. What a
 * runtime i18n library would add on top is 15-40KB of client JavaScript for a
 * page whose entire job is to render fast on a six-year-old Android phone held
 * by someone who is panicking. Translation happens on the server; the client
 * receives resolved strings.
 */
export function getDict(locale: Locale) {
  const dict = DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
  const fallback = DICTS[DEFAULT_LOCALE];

  return function t(path: string, vars?: Record<string, string | number>): string {
    const read = (src: unknown): string | undefined => {
      const value = path.split(".").reduce<unknown>(
        (acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined),
        src,
      );
      return typeof value === "string" ? value : undefined;
    };
    // Fall back to English rather than rendering a raw key path at a scared user.
    let out = read(dict) ?? read(fallback) ?? path;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
    }
    return out;
  };
}

export type T = ReturnType<typeof getDict>;

/** English and Hindi both use the one/other split, so this is enough for now. */
export function plural(t: T, base: string, n: number): string {
  return t(n === 1 ? `${base}_one` : `${base}_other`, { n });
}
