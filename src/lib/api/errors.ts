import { AxiosError } from "axios";

import type { ApiErrorBody, ApiErrorCode, FieldError } from "@/types/api";

/**
 * A failure the UI can act on.
 *
 * The Vue app modelled this with a `Failure` class hierarchy plus an
 * Either-style `left`/`right` return from every repository method, which meant
 * every caller unwrapped a union before it could do anything. Here failures are
 * thrown, TanStack Query catches them, and the parts a component actually
 * branches on -- the code and the field errors -- are plain properties.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    code: ApiErrorCode,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Field-level problems, when the backend rejected the payload. */
  get fieldErrors(): FieldError[] {
    if (this.code !== "VALIDATION_ERROR" || !Array.isArray(this.details)) {
      return [];
    }
    return this.details as FieldError[];
  }

  /** Seconds to wait, when the caller was rate limited. */
  get retryAfterSeconds(): number | null {
    if (!isRecord(this.details)) return null;
    const value = this.details.retry_after_seconds;
    return typeof value === "number" ? value : null;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

/**
 * Converts anything thrown by axios into an ApiError.
 *
 * Network failures and timeouts have no response body, so they are reported as
 * SERVICE_UNAVAILABLE rather than surfacing "Network Error" to the user.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof AxiosError) {
    const response = error.response;

    if (!response) {
      return new ApiError(
        "Tidak dapat terhubung ke server. Periksa koneksi Anda.",
        0,
        "SERVICE_UNAVAILABLE",
      );
    }

    const envelope = response.data as
      { message?: string; error?: ApiErrorBody } | undefined;

    return new ApiError(
      envelope?.message ?? fallbackMessage(response.status),
      response.status,
      envelope?.error?.code ?? codeForStatus(response.status),
      envelope?.error?.details,
    );
  }

  return new ApiError(
    error instanceof Error ? error.message : "Terjadi kesalahan tak terduga.",
    0,
    "INTERNAL_ERROR",
  );
}

function codeForStatus(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "VALIDATION_ERROR";
    case 429:
      return "RATE_LIMITED";
    case 503:
      return "SERVICE_UNAVAILABLE";
    default:
      return "INTERNAL_ERROR";
  }
}

function fallbackMessage(status: number): string {
  if (status >= 500)
    return "Server sedang bermasalah. Coba lagi sebentar lagi.";
  if (status === 403) return "Anda tidak memiliki akses ke halaman ini.";
  if (status === 404) return "Data yang diminta tidak ditemukan.";
  return "Permintaan gagal diproses.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
