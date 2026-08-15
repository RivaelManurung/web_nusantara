import { api } from "@/lib/api/client";
import type { Paginated } from "@/types/api";

import {
  toOrderDetail,
  toOrderSummary,
  toTimelineEntry,
  type OrderDetail,
  type OrderDetailDto,
  type OrderFilters,
  type OrderSummary,
  type OrderSummaryDto,
  type TimelineEntry,
  type TimelineEntryDto,
} from "./types";

const BASE = "/order";

/**
 * Endpoints for the order back office.
 *
 * There is no create and no delete, matching the API: orders come from
 * checkout, and history is cancelled rather than erased.
 */
export const orderApi = {
  async list(
    filters: OrderFilters,
    page: number,
  ): Promise<Paginated<OrderSummary>> {
    const result = await api.getPaginated<OrderSummaryDto>(BASE, {
      params: {
        page,
        // Empty filters are omitted rather than sent blank: the handler reads
        // `status=` as a filter for the empty string and would match nothing.
        ...cleaned(filters),
      },
    });

    return {
      items: result.items.map(toOrderSummary),
      pagination: result.pagination,
    };
  },

  async byId(id: string): Promise<OrderDetail> {
    return toOrderDetail(await api.get<OrderDetailDto>(`${BASE}/${id}`));
  },

  async timeline(id: string): Promise<TimelineEntry[]> {
    const rows = await api.get<TimelineEntryDto[] | null>(
      `${BASE}/${id}/timeline`,
    );
    return (rows ?? []).map(toTimelineEntry);
  },

  /**
   * Moves the order on. The response carries the updated order, including its
   * new set of legal next steps, so the screen does not need a second request
   * to find out what it may do now.
   */
  async setStatus(
    id: string,
    status: string,
    reason: string,
  ): Promise<OrderDetail> {
    return toOrderDetail(
      await api.put<OrderDetailDto>(`${BASE}/${id}/status`, {
        status,
        reason,
      }),
    );
  },
};

/** Drops blank filters so they never reach the query string. */
function cleaned(filters: OrderFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.status) params.status = filters.status;
  if (filters.orderType) params.order_type = filters.orderType;
  if (filters.paymentMethod) params.payment_method = filters.paymentMethod;
  if (filters.search) params.search = filters.search;
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  return params;
}
