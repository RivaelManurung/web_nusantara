/** Whether the voucher cuts a percentage or a fixed rupiah amount. */
export type VoucherDiscountType = "percent" | "amount";

/** A voucher as the API returns it. */
export interface VoucherDto {
  id: string;
  code: string;
  discount_type: VoucherDiscountType;
  /** Rupiah cut when `discount_type` is "amount"; 0 otherwise. */
  discount_amount: number;
  /** Percentage cut when `discount_type` is "percent"; 0 otherwise. */
  discount_percent: number;
  minimum_spend: number;
  point_cost: number;
  start_date: string;
  end_date: string;
  quota: number;
  claimed_count: number;
  description: string;
  /** The API models status as an integer; 1 means active. */
  status: number;
  created_at: string;
}

/** The shape the UI works with. */
export interface Voucher {
  id: string;
  code: string;
  discountType: VoucherDiscountType;
  discountAmount: number;
  discountPercent: number;
  minimumSpend: number;
  pointCost: number;
  /** ISO strings; formatting happens in `@/lib/format`, not here. */
  startDate: string;
  endDate: string;
  quota: number;
  claimedCount: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export function toVoucher(dto: VoucherDto): Voucher {
  return {
    id: dto.id,
    code: dto.code,
    discountType: dto.discount_type,
    discountAmount: dto.discount_amount ?? 0,
    discountPercent: dto.discount_percent ?? 0,
    minimumSpend: dto.minimum_spend ?? 0,
    pointCost: dto.point_cost ?? 0,
    startDate: dto.start_date,
    endDate: dto.end_date,
    quota: dto.quota ?? 0,
    claimedCount: dto.claimed_count ?? 0,
    description: dto.description ?? "",
    isActive: dto.status === 1,
    createdAt: dto.created_at,
  };
}

export interface VoucherInput {
  code: string;
  description: string;
  discountType: VoucherDiscountType;
  discountAmount: number;
  discountPercent: number;
  minimumSpend: number;
  pointCost: number;
  quota: number;
  /** ISO 8601, as the backend stores them. */
  startDate: string;
  endDate: string;
}
