import type { ListParams } from "@/types/api";

/** A customer review as the API returns it. */
export interface ReviewDto {
  id: string;
  product_id: string;
  /** Joined in by the backend so the table can show a name, not an id. */
  product_name: string;
  user_id: string;
  reviewer_name: string;
  /** Null when the review is not tied to a purchase. */
  order_id: string | null;
  /** 1..5. */
  rating: number;
  comment: string;
  /** The API models status as an integer; 1 means visible to shoppers. */
  status: number;
  created_at: string;
  updated_at: string;
}

/** The shape the UI works with. */
export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  reviewerName: string;
  orderId: string | null;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
}

export function toReview(dto: ReviewDto): Review {
  return {
    id: dto.id,
    productId: dto.product_id,
    productName: dto.product_name,
    userId: dto.user_id,
    reviewerName: dto.reviewer_name,
    orderId: dto.order_id,
    rating: dto.rating,
    comment: dto.comment,
    isVisible: dto.status === 1,
    createdAt: dto.created_at,
  };
}

/** The lowest and highest rating a review can carry. */
export const MIN_RATING = 1;
export const MAX_RATING = 5;

/**
 * Visibility as the filter models it.
 *
 * "all" is a separate value rather than `undefined` so the Select always has a
 * selection; the API sees no `status` parameter at all in that case.
 */
export type VisibilityFilter = "all" | "visible" | "hidden";

export interface ReviewListParams extends ListParams {
  /** Absent means every rating. */
  rating?: number;
  visibility?: VisibilityFilter;
}
