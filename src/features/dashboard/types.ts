/**
 * The dashboard's data.
 *
 * Distinct from `src/features/report`: a report answers "what happened over a
 * period" and must reconcile exactly, while this answers "what needs attention
 * now". Same tables, different deadline -- which is why the summary is scoped
 * to today and the anomaly rules are deliberately coarse.
 */

export interface SummaryDto {
  date: string;
  orders_today: number;
  revenue_today: number;
  new_customers_today: number;
  stalled_orders: number;
  awaiting_action: number;
  orders_yesterday: number | null;
  revenue_yesterday: number | null;
}

export interface Summary {
  /** The day these figures cover, so a screen left open overnight is honest. */
  date: string;
  ordersToday: number;
  revenueToday: number;
  newCustomers: number;
  /** Orders sitting in one status too long — the worklist number. */
  stalledOrders: number;
  /** Orders an operator can personally clear right now. */
  awaitingAction: number;
  /** Null when there is no yesterday worth comparing against. */
  ordersYesterday: number | null;
  revenueYesterday: number | null;
}

export function toSummary(dto: SummaryDto): Summary {
  return {
    date: dto.date,
    ordersToday: dto.orders_today,
    revenueToday: dto.revenue_today,
    newCustomers: dto.new_customers_today,
    stalledOrders: dto.stalled_orders,
    awaitingAction: dto.awaiting_action,
    ordersYesterday: dto.orders_yesterday,
    revenueYesterday: dto.revenue_yesterday,
  };
}

/**
 * Percentage change against yesterday, or null when there is nothing to compare.
 *
 * Returning null rather than a number is the point: growth measured from a day
 * with no orders is noise dressed as insight, and "+100%" printed under a
 * headline figure invites decisions it cannot support.
 */
export function changeAgainstYesterday(
  today: number,
  yesterday: number | null,
): number | null {
  if (yesterday === null || yesterday === 0) return null;
  return ((today - yesterday) / yesterday) * 100;
}

export interface TrendPointDto {
  date: string;
  orders: number;
  revenue: number;
}

export interface TrendPoint {
  date: string;
  orders: number;
  revenue: number;
}

export function toTrendPoint(dto: TrendPointDto): TrendPoint {
  return { date: dto.date, orders: dto.orders, revenue: dto.revenue };
}

export interface AnomalyDto {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  rule: string;
  severity: string;
  detail: string;
  metric: number;
}

export interface Anomaly {
  userId: string;
  name: string;
  email: string;
  phone: string;
  rule: string;
  severity: string;
  /** The evidence, in the operator's language. */
  detail: string;
  metric: number;
}

export function toAnomaly(dto: AnomalyDto): Anomaly {
  return {
    userId: dto.user_id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    rule: dto.rule,
    severity: dto.severity,
    detail: dto.detail,
    metric: dto.metric,
  };
}

const RULE_LABELS: Record<string, string> = {
  VOUCHER_HOARDING: "Menimbun voucher",
  HIGH_CANCEL_RATE: "Sering membatalkan",
  POINT_DRIFT: "Saldo poin tidak cocok",
};

/** An unknown rule is echoed, so a newly added one is visible rather than blank. */
export function ruleLabel(rule: string): string {
  return RULE_LABELS[rule] ?? rule;
}
