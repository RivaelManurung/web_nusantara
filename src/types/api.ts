/**
 * Wire format of the Nusantara API.
 *
 * The backend wraps every response in the same envelope, so these types are
 * declared once here rather than re-described in each feature.
 */

export interface Envelope<T> {
  status_code: number;
  message: string;
  data?: T;
  error?: ApiErrorBody;
  pagination?: Pagination;
}

export interface ApiErrorBody {
  code: ApiErrorCode;
  details?: unknown;
}

/**
 * Stable machine-readable codes. Switch on these rather than on `message`,
 * which is prose meant for humans and may be reworded at any time.
 */
export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "PAYLOAD_TOO_LARGE"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

/** One rejected field, as returned with VALIDATION_ERROR. */
export interface FieldError {
  field: string;
  message: string;
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total_data: number;
  total_pages: number;
}

/** A list response, flattened out of the envelope for callers. */
export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface ListParams {
  page?: number;
  per_page?: number;
  search?: string;
}
