/**
 * Loyalty points, as the back office sees them.
 *
 * The shape here mirrors a deliberate decision on the server: the ledger is the
 * truth and `user_points.total_points` is a cache. Every balance therefore
 * arrives as three numbers rather than one, and the screen shows the difference
 * instead of hiding it -- a silent repair would destroy the evidence of whatever
 * wrote the wrong value.
 */

export type PointDirection = "in" | "out";

export interface BalanceDto {
  user_id: string;
  cached_balance: number;
  ledger_balance: number;
  drift: number;
  entry_count: number;
  expired_inflow: number;
  updated_at: string | null;
}

export interface Balance {
  userId: string;
  /** What every other screen reads. */
  cached: number;
  /** SUM(in) - SUM(out): the truth. */
  ledger: number;
  /** cached - ledger. Non-zero means the two halves disagree. */
  drift: number;
  entryCount: number;
  /**
   * Points that came in and have passed their expiry date. A large number here
   * with no matching outflow is the signature of an expiry job that never runs.
   */
  expiredInflow: number;
  updatedAt: string | null;
}

export function toBalance(dto: BalanceDto): Balance {
  return {
    userId: dto.user_id,
    cached: dto.cached_balance,
    ledger: dto.ledger_balance,
    drift: dto.drift,
    entryCount: dto.entry_count,
    expiredInflow: dto.expired_inflow,
    updatedAt: dto.updated_at,
  };
}

export function isReconciled(balance: Balance): boolean {
  return balance.drift === 0;
}

export interface PointEntryDto {
  id: string;
  direction: string;
  points: number;
  point_type: string;
  source: string;
  source_id: string;
  description: string;
  expired_at: string | null;
  created_at: string;
  is_expired: boolean;
}

export interface PointEntry {
  id: string;
  direction: string;
  points: number;
  pointType: string;
  source: string;
  sourceId: string;
  description: string;
  expiredAt: string | null;
  createdAt: string;
  isExpired: boolean;
}

export function toPointEntry(dto: PointEntryDto): PointEntry {
  return {
    id: dto.id,
    direction: dto.direction,
    points: dto.points,
    pointType: dto.point_type,
    source: dto.source,
    sourceId: dto.source_id,
    description: dto.description,
    expiredAt: dto.expired_at,
    createdAt: dto.created_at,
    isExpired: dto.is_expired,
  };
}

/** Written by an operator rather than by the system. */
export const SOURCE_ADJUSTMENT = "MANUAL_ADJUSTMENT";

const SOURCE_LABELS: Record<string, string> = {
  [SOURCE_ADJUSTMENT]: "Koreksi manual",
  ORDER: "Pesanan",
  VOUCHER: "Tukar voucher",
};

/** An unrecognised source is echoed, so a new one is visible rather than blank. */
export function sourceLabel(source: string): string {
  if (!source) return "-";
  return SOURCE_LABELS[source] ?? source;
}

export interface ClaimedVoucherDto {
  id: string;
  voucher_id: string;
  code: string;
  description: string;
  is_used: boolean;
  claimed_at: string;
  redeemed_at: string | null;
  valid_until: string | null;
}

export interface ClaimedVoucher {
  id: string;
  voucherId: string;
  code: string;
  description: string;
  isUsed: boolean;
  claimedAt: string;
  redeemedAt: string | null;
  validUntil: string | null;
}

export function toClaimedVoucher(dto: ClaimedVoucherDto): ClaimedVoucher {
  return {
    id: dto.id,
    voucherId: dto.voucher_id,
    code: dto.code,
    description: dto.description,
    isUsed: dto.is_used,
    claimedAt: dto.claimed_at,
    redeemedAt: dto.redeemed_at,
    validUntil: dto.valid_until,
  };
}

/** One manual correction, as the dialog submits it. */
export interface AdjustmentInput {
  points: number;
  direction: PointDirection;
  reason: string;
}
