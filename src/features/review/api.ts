import { api } from "@/lib/api/client";
import type { Paginated } from "@/types/api";

import {
  toReview,
  type Review,
  type ReviewDto,
  type ReviewListParams,
} from "./types";

const BASE = "/review";

/**
 * Endpoints for customer reviews.
 *
 * Admin-facing only: the dashboard moderates and removes reviews, it never
 * writes one. Composing a review belongs to the customer app, and the backend
 * exposes no create endpoint for it yet.
 */
export const reviewApi = {
  async list(params: ReviewListParams): Promise<Paginated<Review>> {
    const result = await api.getPaginated<ReviewDto>(BASE, {
      params: {
        page: params.page ?? 1,
        // An empty search must not become `search=`, which some handlers treat
        // as a filter for the empty string.
        ...(params.search ? { search: params.search } : {}),
        ...(params.rating ? { rating: params.rating } : {}),
        // Hidden is status 0, so a truthiness check would drop this filter.
        ...(params.visibility && params.visibility !== "all"
          ? { status: params.visibility === "visible" ? 1 : 0 }
          : {}),
      },
    });

    return {
      items: result.items.map(toReview),
      pagination: result.pagination,
    };
  },

  async byId(id: string): Promise<Review> {
    return toReview(await api.get<ReviewDto>(`${BASE}/${id}`));
  },

  /** Moderation: show the review to shoppers, or take it down. */
  async setStatus(id: string, isVisible: boolean): Promise<void> {
    await api.put(`${BASE}/${id}/edit-status`, { status: isVisible ? 1 : 0 });
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}/delete`);
  },
};
