import { api } from "@/lib/api/client";
import type { ListParams, Paginated } from "@/types/api";

import {
  toVoucher,
  type Voucher,
  type VoucherDto,
  type VoucherInput,
} from "./types";

const BASE = "/voucher";

/**
 * Endpoints for vouchers.
 *
 * Unlike banners and events these carry no file, so the payload is plain JSON
 * in the backend's snake_case.
 */
export const voucherApi = {
  async list(params: ListParams): Promise<Paginated<Voucher>> {
    const result = await api.getPaginated<VoucherDto>(BASE, {
      params: {
        page: params.page ?? 1,
        // An empty search must not become `search=`, which some handlers treat
        // as a filter for the empty string.
        ...(params.search ? { search: params.search } : {}),
      },
    });

    return {
      items: result.items.map(toVoucher),
      pagination: result.pagination,
    };
  },

  async byId(id: string): Promise<Voucher> {
    return toVoucher(await api.get<VoucherDto>(`${BASE}/${id}`));
  },

  async create(input: VoucherInput): Promise<Voucher> {
    // Status is settable only at creation time; `/edit-status` handles it after.
    return toVoucher(
      await api.post<VoucherDto>(`${BASE}/create`, {
        ...toPayload(input),
        status: 1,
      }),
    );
  },

  async update(id: string, input: VoucherInput): Promise<Voucher> {
    return toVoucher(
      await api.put<VoucherDto>(`${BASE}/${id}/edit`, toPayload(input)),
    );
  },

  async setStatus(id: string, isActive: boolean): Promise<void> {
    await api.put(`${BASE}/${id}/edit-status`, { status: isActive ? 1 : 0 });
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}/delete`);
  },
};

/**
 * The unused half of the discount pair is sent as 0 rather than omitted: the
 * backend keeps both columns, and leaving the old value in place would make a
 * voucher switched from percent to amount still read as a percentage discount.
 */
function toPayload(input: VoucherInput): Record<string, unknown> {
  const isPercent = input.discountType === "percent";

  return {
    code: input.code,
    description: input.description,
    quota: input.quota,
    discount_type: input.discountType,
    discount_percent: isPercent ? input.discountPercent : 0,
    discount_amount: isPercent ? 0 : input.discountAmount,
    minimum_spend: input.minimumSpend,
    point_cost: input.pointCost,
    start_date: input.startDate,
    end_date: input.endDate,
  };
}
