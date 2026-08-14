import type { TokenPair } from "@/types/auth";

/**
 * Where the session lives in the browser.
 *
 * Two deliberate differences from the Vue app, which kept a single
 * `auth_token` in localStorage:
 *
 *  - The backend now issues an access/refresh pair, so both are stored and the
 *    access token's expiry is tracked to refresh before a request fails.
 *  - Reads are guarded for the server, because Next renders these modules on
 *    the server too and `localStorage` does not exist there.
 */

const ACCESS_KEY = "nusantara.access_token";
const REFRESH_KEY = "nusantara.refresh_token";
const EXPIRES_KEY = "nusantara.expires_at";

/** Refresh this long before the token actually expires. */
const EXPIRY_SKEW_MS = 30_000;

const isBrowser = () => typeof window !== "undefined";

export const tokenStorage = {
  get accessToken(): string | null {
    return isBrowser() ? window.localStorage.getItem(ACCESS_KEY) : null;
  },

  get refreshToken(): string | null {
    return isBrowser() ? window.localStorage.getItem(REFRESH_KEY) : null;
  },

  /** True when there is no access token, or it is about to expire. */
  get isAccessTokenStale(): boolean {
    if (!isBrowser()) return true;

    const token = window.localStorage.getItem(ACCESS_KEY);
    if (!token) return true;

    const expiresAt = window.localStorage.getItem(EXPIRES_KEY);
    if (!expiresAt) return false;

    return Date.parse(expiresAt) - EXPIRY_SKEW_MS <= Date.now();
  },

  save(pair: TokenPair): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(ACCESS_KEY, pair.access_token);
    window.localStorage.setItem(REFRESH_KEY, pair.refresh_token);
    window.localStorage.setItem(EXPIRES_KEY, pair.expires_at);
    // The middleware cannot read localStorage, so a non-sensitive marker
    // cookie tells it whether to let a dashboard request through.
    document.cookie = `nusantara.session=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
  },

  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.localStorage.removeItem(EXPIRES_KEY);
    document.cookie = "nusantara.session=; path=/; max-age=0; samesite=lax";
  },
};
