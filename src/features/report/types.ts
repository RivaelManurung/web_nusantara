/**
 * Report DTOs.
 *
 * Both report screens read the same period and the same order statuses, so the
 * status vocabulary lives here once. `is_revenue` is sent by the API rather
 * than recomputed in the browser: the financial page must count exactly the
 * orders the backend counted, and a second copy of that rule here would drift.
 */

export type OrderStatus =
  | "ORDER_DRAFT"
  | "WAITING_PAYMENT"
  | "PAID"
  | "WAITING_STORE_CONFIRMATION"
  | "STORE_ACCEPTED"
  | "STORE_REJECTED"
  | "SEARCHING_DRIVER"
  | "DRIVER_ASSIGNED"
  | "ON_THE_WAY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELED";

/** Lifecycle order, used for the status filter and the summary cards. */
export const ORDER_STATUSES: OrderStatus[] = [
  "ORDER_DRAFT",
  "WAITING_PAYMENT",
  "PAID",
  "WAITING_STORE_CONFIRMATION",
  "STORE_ACCEPTED",
  "STORE_REJECTED",
  "SEARCHING_DRIVER",
  "DRIVER_ASSIGNED",
  "ON_THE_WAY",
  "DELIVERED",
  "COMPLETED",
  "CANCELED",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  ORDER_DRAFT: "Draf",
  WAITING_PAYMENT: "Menunggu pembayaran",
  PAID: "Dibayar",
  WAITING_STORE_CONFIRMATION: "Menunggu konfirmasi toko",
  STORE_ACCEPTED: "Diterima toko",
  STORE_REJECTED: "Ditolak toko",
  SEARCHING_DRIVER: "Mencari kurir",
  DRIVER_ASSIGNED: "Kurir ditugaskan",
  ON_THE_WAY: "Dalam perjalanan",
  DELIVERED: "Terkirim",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
};

export function statusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
}

export type PaymentMethod = "CASH" | "QRIS" | "TRANSFER";

export const PAYMENT_METHODS: PaymentMethod[] = ["CASH", "QRIS", "TRANSFER"];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
};

export function paymentLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method;
}

export type Granularity = "day" | "week" | "month";

export const GRANULARITY_LABELS: Record<Granularity, string> = {
  day: "Harian",
  week: "Mingguan",
  month: "Bulanan",
};

/** The filters every report endpoint accepts. Dates are `yyyy-MM-dd`. */
export interface ReportFilters {
  from: string;
  to: string;
  status?: OrderStatus | "";
  shopId?: string;
  paymentMethod?: PaymentMethod | "";
}

// --- transactions ------------------------------------------------------

export interface TransactionDto {
  id: string;
  code: string;
  created_at: string;
  customer_name: string;
  shop_name: string;
  item_count: number;
  sub_total: number;
  discount_event: number;
  discount_voucher: number;
  shipping_fee: number;
  total: number;
  status: string;
  payment_method: string;
  order_type: string;
  is_revenue: boolean;
}

export interface Transaction {
  id: string;
  code: string;
  createdAt: string;
  customerName: string;
  shopName: string;
  itemCount: number;
  subTotal: number;
  discountEvent: number;
  discountVoucher: number;
  shippingFee: number;
  total: number;
  status: string;
  paymentMethod: string;
  orderType: string;
  /** Whether this row's money is included in the financial report. */
  isRevenue: boolean;
}

export function toTransaction(dto: TransactionDto): Transaction {
  return {
    id: dto.id,
    code: dto.code,
    createdAt: dto.created_at,
    customerName: dto.customer_name,
    shopName: dto.shop_name,
    itemCount: dto.item_count,
    subTotal: dto.sub_total,
    discountEvent: dto.discount_event,
    discountVoucher: dto.discount_voucher,
    shippingFee: dto.shipping_fee,
    total: dto.total,
    status: dto.status,
    paymentMethod: dto.payment_method,
    orderType: dto.order_type,
    isRevenue: dto.is_revenue,
  };
}

export interface StatusSummaryDto {
  status: string;
  order_count: number;
  sub_total: number;
  discount_event: number;
  discount_voucher: number;
  shipping_fee: number;
  total: number;
  is_revenue: boolean;
}

export interface TransactionSummaryDto {
  from: string;
  to: string;
  statuses: StatusSummaryDto[] | null;
  order_count: number;
  total: number;
  revenue_order_count: number;
  revenue_total: number;
}

export interface StatusSummary {
  status: string;
  orderCount: number;
  total: number;
  isRevenue: boolean;
}

export interface TransactionSummary {
  from: string;
  to: string;
  statuses: StatusSummary[];
  orderCount: number;
  total: number;
  revenueOrderCount: number;
  revenueTotal: number;
}

export function toTransactionSummary(
  dto: TransactionSummaryDto,
): TransactionSummary {
  return {
    from: dto.from,
    to: dto.to,
    // A period with no orders omits the array entirely rather than sending [].
    statuses: (dto.statuses ?? []).map((row) => ({
      status: row.status,
      orderCount: row.order_count,
      total: row.total,
      isRevenue: row.is_revenue,
    })),
    orderCount: dto.order_count,
    total: dto.total,
    revenueOrderCount: dto.revenue_order_count,
    revenueTotal: dto.revenue_total,
  };
}

// --- financial ---------------------------------------------------------

export interface RevenuePointDto {
  bucket: string;
  order_count: number;
  gross: number;
  discount_event: number;
  discount_voucher: number;
  shipping: number;
  net: number;
}

export interface FinancialTotalsDto {
  order_count: number;
  gross: number;
  discount_event: number;
  discount_voucher: number;
  shipping: number;
  net: number;
}

export interface FinancialReportDto {
  from: string;
  to: string;
  granularity: Granularity;
  points: RevenuePointDto[] | null;
  totals: FinancialTotalsDto;
  revenue_statuses: string[] | null;
}

export interface RevenuePoint {
  bucket: string;
  orderCount: number;
  gross: number;
  discountEvent: number;
  discountVoucher: number;
  shipping: number;
  net: number;
}

export interface FinancialTotals {
  orderCount: number;
  gross: number;
  discountEvent: number;
  discountVoucher: number;
  shipping: number;
  net: number;
}

export interface FinancialReport {
  from: string;
  to: string;
  granularity: Granularity;
  points: RevenuePoint[];
  totals: FinancialTotals;
  revenueStatuses: string[];
}

export function toFinancialReport(dto: FinancialReportDto): FinancialReport {
  return {
    from: dto.from,
    to: dto.to,
    granularity: dto.granularity,
    points: (dto.points ?? []).map((point) => ({
      bucket: point.bucket,
      orderCount: point.order_count,
      gross: point.gross,
      discountEvent: point.discount_event,
      discountVoucher: point.discount_voucher,
      shipping: point.shipping,
      net: point.net,
    })),
    totals: {
      orderCount: dto.totals.order_count,
      gross: dto.totals.gross,
      discountEvent: dto.totals.discount_event,
      discountVoucher: dto.totals.discount_voucher,
      shipping: dto.totals.shipping,
      net: dto.totals.net,
    },
    revenueStatuses: dto.revenue_statuses ?? [],
  };
}

export interface TopProductDto {
  product_id: string;
  product_name: string;
  product_code: string;
  quantity: number;
  revenue: number;
  order_count: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  revenue: number;
  orderCount: number;
}

export function toTopProduct(dto: TopProductDto): TopProduct {
  return {
    productId: dto.product_id,
    productName: dto.product_name,
    productCode: dto.product_code,
    quantity: dto.quantity,
    revenue: dto.revenue,
    orderCount: dto.order_count,
  };
}
