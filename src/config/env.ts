/**
 * Environment access.
 *
 * Reading is lazy on purpose. An earlier version validated at module load,
 * which meant a missing variable threw while Next was merely *evaluating* the
 * module during prerender -- taking down pages such as /_not-found that never
 * touch the API, and failing the whole build on Vercel rather than the one
 * screen that actually needed configuring.
 *
 * Now nothing throws until something genuinely needs the value, and the message
 * says exactly which setting is missing and where to put it.
 */

/** Reads a public variable, or an empty string when it is unset. */
function read(value: string | undefined): string {
  return value?.trim() ?? "";
}

/**
 * NEXT_PUBLIC_* values are inlined by the bundler at build time, so
 * `process.env.NEXT_PUBLIC_API_BASE_URL` must be referenced literally here --
 * a dynamic lookup would leave it undefined in the browser bundle.
 */
const API_BASE_URL = read(process.env.NEXT_PUBLIC_API_BASE_URL);
const GOOGLE_MAPS_API_KEY = read(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

/** Whether the API base URL was supplied at build time. */
export function isApiConfigured(): boolean {
  return API_BASE_URL !== "";
}

/**
 * The API root, including the version prefix.
 *
 * Throws when unset, so a misconfigured deployment fails loudly at the first
 * request instead of silently issuing requests to the wrong origin.
 */
export function getApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Add it to .env.local for local " +
        "development, or to the project's Environment Variables when " +
        "deploying, then rebuild — this value is baked in at build time.",
    );
  }
  return API_BASE_URL;
}

export const env = {
  /** Optional: only the shop location picker needs it. */
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
} as const;
