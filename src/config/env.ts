/**
 * Environment access, validated once at module load.
 *
 * The Vue app read `import.meta.env` at the point of use and threw at runtime
 * when a variable was missing. Failing here instead means a misconfigured
 * deployment breaks the build, not the first request a user makes.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `${name} is not set. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export const env = {
  apiBaseUrl: required(
    "NEXT_PUBLIC_API_BASE_URL",
    process.env.NEXT_PUBLIC_API_BASE_URL,
  ),
  /** Optional: only the location picker needs it. */
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
} as const;
