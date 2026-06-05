import {
  createClient as baseCreateClient,
  ClientConfig,
  Route,
} from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import sm from "../slicemachine.config.json";

export const PRISMIC_LANG_COOKIE = "fsl-lang";
export const DEFAULT_LOCALE = (
  process.env.NEXT_PUBLIC_PRISMIC_DEFAULT_LOCALE || "en-us"
).toLowerCase();

const configuredLocales =
  process.env.NEXT_PUBLIC_PRISMIC_LANGUAGES?.split(",")
    .map((locale) => locale.trim().toLowerCase())
    .filter(Boolean) ?? [];

const fallbackLocales = ["en-us", "nl-nl"];

export const LOCALES =
  configuredLocales.length === 2
    ? configuredLocales
    : configuredLocales.length === 1
      ? [configuredLocales[0], configuredLocales[0].startsWith("en-") ? "nl-nl" : "en-us"]
      : fallbackLocales;

export function getPrismicLang(input?: string | null): string | undefined {
  if (!input) {
    return undefined;
  }

  const normalized = input.toLowerCase();

  if (LOCALES.includes(normalized)) {
    return normalized;
  }

  const languageOnlyMatch = LOCALES.find((locale) => locale.startsWith(`${normalized}-`));
  if (languageOnlyMatch) {
    return languageOnlyMatch;
  }

  return undefined;
}

export function getDefaultPrismicLang(): string {
  const configuredDefault = getPrismicLang(DEFAULT_LOCALE);
  return configuredDefault ?? LOCALES[0] ?? "en-us";
}

/**
 * The project's Prismic repository name.
 */
export const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

/**
 * The project's Prismic route resolvers. This list determines a Prismic document's URL.
 */
const routes: Route[] = [
  { type: "page", uid: "home", path: "/" },
  { type: "page", path: "/:uid" },
];

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config - Configuration for the Prismic client.
 */
export function createClient(config: ClientConfig = {}) {
  const client = baseCreateClient(sm.apiEndpoint || repositoryName, {
    routes,
    fetchOptions:
      process.env.NODE_ENV === "production"
        ? { next: { tags: ["prismic"] }, cache: "force-cache" }
        : { next: { revalidate: 5 } },
    ...config,
  });

  enableAutoPreviews({ client });

  return client;
}
