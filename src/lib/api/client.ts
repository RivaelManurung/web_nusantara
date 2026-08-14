import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/config/env";
import { tokenStorage } from "@/lib/auth/token-storage";
import type { Envelope, Paginated } from "@/types/api";
import type { TokenPair } from "@/types/auth";

import { ApiError, toApiError } from "./errors";

/** Called when the session cannot be recovered, so the app can sign the user out. */
type SessionExpiredHandler = () => void;

let onSessionExpired: SessionExpiredHandler = () => {};

export function setSessionExpiredHandler(handler: SessionExpiredHandler): void {
  onSessionExpired = handler;
}

const http: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

/**
 * In-flight refresh, shared by every request that finds an expired token.
 *
 * Without this, a dashboard that fires six queries on mount would send six
 * refresh requests; since the backend rotates refresh tokens and treats each as
 * single use, five of them would fail and log the user out.
 */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.refreshToken;
  if (!refreshToken) return null;

  try {
    // A bare axios call: going through `http` would recurse into this
    // interceptor.
    const response = await axios.post<Envelope<TokenPair>>(
      `${env.apiBaseUrl}/auth/refresh`,
      { refresh_token: refreshToken },
      { headers: { "Content-Type": "application/json" }, timeout: 15_000 },
    );

    const pair = response.data.data;
    if (!pair) return null;

    tokenStorage.save(pair);
    return pair.access_token;
  } catch {
    return null;
  }
}

async function ensureFreshToken(): Promise<string | null> {
  if (!tokenStorage.isAccessTokenStale) {
    return tokenStorage.accessToken;
  }

  refreshInFlight ??= refreshAccessToken().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // The refresh endpoint authenticates with its body, not a bearer token.
  if (config.url?.includes("/auth/refresh")) return config;

  const token = await ensureFreshToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const apiError = toApiError(error);

    // A 401 that survives a proactive refresh means the session is genuinely
    // gone: the refresh token was revoked, rotated by another tab, or expired.
    if (apiError.isUnauthorized) {
      tokenStorage.clear();
      onSessionExpired();
    }

    throw apiError;
  },
);

/** Unwraps the envelope, so callers receive the payload rather than the wrapper. */
function unwrap<T>(envelope: Envelope<T>): T {
  if (envelope.data === undefined) {
    throw new ApiError(
      envelope.message || "Server mengirim respons kosong.",
      envelope.status_code,
      envelope.error?.code ?? "INTERNAL_ERROR",
    );
  }
  return envelope.data;
}

export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await http.get<Envelope<T>>(url, config);
    return unwrap(data);
  },

  /** Like get, but keeps the pagination block the envelope carries alongside the rows. */
  async getPaginated<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<Paginated<T>> {
    const { data } = await http.get<Envelope<T[]>>(url, config);
    return {
      items: data.data ?? [],
      pagination: data.pagination ?? {
        current_page: 1,
        per_page: (data.data ?? []).length,
        total_data: (data.data ?? []).length,
        total_pages: 1,
      },
    };
  },

  async post<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await http.post<Envelope<T>>(url, body, config);
    return unwrap(data);
  },

  async put<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await http.put<Envelope<T>>(url, body, config);
    return unwrap(data);
  },

  async patch<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await http.patch<Envelope<T>>(url, body, config);
    return unwrap(data);
  },

  async delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await http.delete<Envelope<T>>(url, config);
    return (data.data ?? undefined) as T;
  },

  /**
   * Multipart upload. The Content-Type header is deleted rather than set, so
   * the browser can generate the multipart boundary itself.
   */
  async upload<T>(
    url: string,
    form: FormData,
    method: "post" | "put" = "post",
  ): Promise<T> {
    const { data } = await http.request<Envelope<T>>({
      url,
      method,
      data: form,
      headers: { "Content-Type": undefined },
    });
    return unwrap(data);
  },
};

export { http };
