import { api } from "@/lib/api/client";
import type { ListParams, Paginated } from "@/types/api";

import {
  toBroadcast,
  toBroadcastBody,
  toBroadcastResult,
  toCustomer,
  type Broadcast,
  type BroadcastDto,
  type BroadcastInput,
  type BroadcastResult,
  type BroadcastResultDto,
  type Customer,
  type CustomerDto,
} from "./types";

const BASE = "/notification";

/**
 * Endpoints for sending notifications to the mobile app.
 *
 * Both are guarded by the same permission on the server (`notification.write`):
 * whoever may notify a customer may look one up, and nobody else may. The
 * customer directory therefore hangs off this group rather than off a general
 * user listing.
 */
export const notificationApi = {
  async send(input: BroadcastInput): Promise<BroadcastResult> {
    return toBroadcastResult(
      await api.post<BroadcastResultDto>(`${BASE}/send`, toBroadcastBody(input)),
    );
  },

  /**
   * The send history: one record per broadcast, newest first.
   *
   * Not the same thing as `GET /notification`, which is the *caller's own*
   * inbox and would show an admin their personal messages rather than what the
   * shop has sent.
   */
  async broadcasts(page: number): Promise<Paginated<Broadcast>> {
    const result = await api.getPaginated<BroadcastDto>(`${BASE}/broadcast`, {
      params: { page },
    });

    return {
      items: result.items.map(toBroadcast),
      pagination: result.pagination,
    };
  },

  async customers(params: ListParams): Promise<Paginated<Customer>> {
    const result = await api.getPaginated<CustomerDto>(`${BASE}/audience`, {
      params: {
        page: params.page ?? 1,
        // An empty search must not become `search=`, which some handlers treat
        // as a filter for the empty string.
        ...(params.search ? { search: params.search } : {}),
      },
    });

    return {
      items: result.items.map(toCustomer),
      pagination: result.pagination,
    };
  },
};
