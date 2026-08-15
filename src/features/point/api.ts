import { api } from "@/lib/api/client";
import type { Paginated } from "@/types/api";

import {
  toBalance,
  toClaimedVoucher,
  toPointEntry,
  type AdjustmentInput,
  type Balance,
  type BalanceDto,
  type ClaimedVoucher,
  type ClaimedVoucherDto,
  type PointEntry,
  type PointEntryDto,
} from "./types";

const BASE = "/user";

/**
 * Endpoints for the loyalty ledger.
 *
 * These hang off /user/{id} because points are account data, and are guarded by
 * the same permissions as the account screen itself: whoever may read an
 * account may read its balance, whoever may moderate it may correct one.
 */
export const pointApi = {
  async balance(userId: string): Promise<Balance> {
    return toBalance(await api.get<BalanceDto>(`${BASE}/${userId}/point`));
  },

  async history(
    userId: string,
    page: number,
    direction: string,
  ): Promise<Paginated<PointEntry>> {
    const result = await api.getPaginated<PointEntryDto>(
      `${BASE}/${userId}/point/history`,
      {
        params: {
          page,
          // An empty direction must not become `direction=`, which the handler
          // would reject as an unknown filter value.
          ...(direction ? { direction } : {}),
        },
      },
    );

    return {
      items: result.items.map(toPointEntry),
      pagination: result.pagination,
    };
  },

  /**
   * Applies a manual correction.
   *
   * The response carries the recomputed balance, so the screen shows the new
   * ledger total -- and any remaining drift -- without a second request.
   */
  async adjust(userId: string, input: AdjustmentInput): Promise<Balance> {
    return toBalance(
      await api.post<BalanceDto>(`${BASE}/${userId}/point/adjust`, {
        points: input.points,
        direction: input.direction,
        reason: input.reason,
      }),
    );
  },

  async claimedVouchers(userId: string): Promise<ClaimedVoucher[]> {
    const rows = await api.get<ClaimedVoucherDto[] | null>(
      `${BASE}/${userId}/voucher`,
    );
    return (rows ?? []).map(toClaimedVoucher);
  },
};
