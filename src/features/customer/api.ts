import { api } from "@/lib/api/client";
import type { Paginated } from "@/types/api";

import {
  toCustomerDetail,
  toCustomerSummary,
  type CustomerDetail,
  type CustomerDetailDto,
  type CustomerFilters,
  type CustomerSummary,
  type CustomerSummaryDto,
} from "./types";

const BASE = "/user";

/**
 * Endpoints for account moderation.
 *
 * There is no create, no edit and no delete, matching the API: accounts are
 * created by people signing up, their details are theirs to change through
 * /auth, and deleting one would orphan its orders and break every report that
 * counts them. Blocking is the reversible, auditable alternative.
 */
export const customerApi = {
  async list(
    filters: CustomerFilters,
    page: number,
  ): Promise<Paginated<CustomerSummary>> {
    const result = await api.getPaginated<CustomerSummaryDto>(BASE, {
      params: {
        page,
        // Blank filters are omitted rather than sent empty: the handler reads
        // `role=` as a filter for the empty string and would match nothing.
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.role ? { role: filters.role } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
    });

    return {
      items: result.items.map(toCustomerSummary),
      pagination: result.pagination,
    };
  },

  async byId(id: string): Promise<CustomerDetail> {
    return toCustomerDetail(await api.get<CustomerDetailDto>(`${BASE}/${id}`));
  },

  /** Role names, so the filter is built from the database rather than a constant. */
  async roles(): Promise<string[]> {
    return (await api.get<string[] | null>(`${BASE}/roles`)) ?? [];
  },

  /**
   * Blocks or unblocks an account.
   *
   * The reason is mandatory server-side when blocking, and the response carries
   * the updated account including the audit row just written -- so the screen
   * does not need a second request to show what happened.
   */
  async setStatus(
    id: string,
    isActive: boolean,
    reason: string,
  ): Promise<CustomerDetail> {
    return toCustomerDetail(
      await api.put<CustomerDetailDto>(`${BASE}/${id}/status`, {
        status: isActive ? 1 : 0,
        reason,
      }),
    );
  },
};
