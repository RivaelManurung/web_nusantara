/**
 * Orders, as the back office sees them.
 *
 * The status vocabulary is the API's, not this file's invention: it mirrors
 * internal/model/order.go and is validated server-side by
 * internal/modules/order. What lives here is only the Indonesian label and the
 * badge tone for each one, because those are presentation.
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

export type OrderType = "TAKE_AWAY" | "DELIVERY";
export type PaymentMethod = "CASH" | "QRIS" | "TRANSFER";

/** Lifecycle order, used to render the status filter as a funnel. */
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

const STATUS_LABELS: Record<OrderStatus, string> = {
  ORDER_DRAFT: "Draf",
  WAITING_PAYMENT: "Menunggu pembayaran",
  PAID: "Sudah dibayar",
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

/**
 * An unknown status is echoed rather than blanked. If the API gains a state
 * this build has not heard of, showing the raw code is far more useful to an
 * operator -- and to whoever they report it to -- than an empty cell.
 */
export function statusLabel(status: string): string {
  return STATUS_LABELS[status as OrderStatus] ?? status;
}

/** Badge tone per status: red for failure, green for done, amber for waiting. */
export type StatusTone =
  | "neutral"
  | "waiting"
  | "progress"
  | "success"
  | "danger";

const STATUS_TONES: Record<OrderStatus, StatusTone> = {
  ORDER_DRAFT: "neutral",
  WAITING_PAYMENT: "waiting",
  PAID: "progress",
  WAITING_STORE_CONFIRMATION: "waiting",
  STORE_ACCEPTED: "progress",
  STORE_REJECTED: "danger",
  SEARCHING_DRIVER: "waiting",
  DRIVER_ASSIGNED: "progress",
  ON_THE_WAY: "progress",
  DELIVERED: "progress",
  COMPLETED: "success",
  CANCELED: "danger",
};

export function statusTone(status: string): StatusTone {
  return STATUS_TONES[status as OrderStatus] ?? "neutral";
}

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  TAKE_AWAY: "Ambil sendiri",
  DELIVERY: "Diantar",
};

export function orderTypeLabel(value: string): string {
  return ORDER_TYPE_LABELS[value as OrderType] ?? value;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
};

export function paymentLabel(value: string): string {
  return PAYMENT_LABELS[value as PaymentMethod] ?? value;
}

// --- wire shapes -------------------------------------------------------

export interface OrderSummaryDto {
  id: string;
  code: string;
  status: string;
  order_type: string;
  payment_method: string;
  customer_id: string;
  customer_name: string;
  shop_id: string;
  shop_name: string;
  item_count: number;
  total: number;
  created_at: string;
  updated_at: string;
  stalled_for_minutes: number;
}

export interface OrderItemDto {
  id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  image: string;
  quantity: number;
  sub_total: number;
}

export interface OrderAddressDto {
  label: string;
  full_address: string;
  lat: number;
  lng: number;
}

export interface AppliedVoucherDto {
  voucher_id: string;
  code: string;
  description: string;
}

export interface AppliedEventDto {
  event_id: string;
  name: string;
  type: string;
  discount: number;
}

export interface OrderDetailDto extends OrderSummaryDto {
  customer_email: string;
  customer_phone: string;
  shop_address: string;
  sub_total: number;
  discount_event: number;
  discount_voucher: number;
  shipping_fee: number;
  note: string;
  address: OrderAddressDto | null;
  items: OrderItemDto[];
  vouchers: AppliedVoucherDto[];
  events: AppliedEventDto[];
  next_statuses: string[];
  reason_required_for: string[];
}

export interface TimelineEntryDto {
  id: string;
  from_status: string;
  to_status: string;
  reason: string;
  actor_id: string | null;
  actor_name: string;
  created_at: string;
}

// --- view models -------------------------------------------------------

export interface OrderSummary {
  id: string;
  code: string;
  status: string;
  orderType: string;
  paymentMethod: string;
  customerId: string;
  customerName: string;
  shopId: string;
  shopName: string;
  itemCount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  /** Minutes spent in the current status -- the "is this stuck?" signal. */
  stalledForMinutes: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  image: string;
  quantity: number;
  subTotal: number;
}

export interface OrderAddress {
  label: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

export interface AppliedVoucher {
  voucherId: string;
  code: string;
  description: string;
}

export interface AppliedEvent {
  eventId: string;
  name: string;
  type: string;
  discount: number;
}

export interface OrderDetail extends OrderSummary {
  customerEmail: string;
  customerPhone: string;
  shopAddress: string;
  subTotal: number;
  discountEvent: number;
  discountVoucher: number;
  shippingFee: number;
  note: string;
  address: OrderAddress | null;
  items: OrderItem[];
  vouchers: AppliedVoucher[];
  events: AppliedEvent[];
  /**
   * What this order may become next, already filtered by order type on the
   * server. The screen renders one button per entry rather than owning a second
   * copy of the lifecycle -- the duplication that let the old dashboard and the
   * old report disagree about which statuses counted as a sale.
   */
  nextStatuses: string[];
  /** The subset of nextStatuses whose dialog must demand a reason. */
  reasonRequiredFor: string[];
}

export interface TimelineEntry {
  id: string;
  fromStatus: string;
  toStatus: string;
  reason: string;
  actorId: string | null;
  actorName: string;
  createdAt: string;
}

export function toOrderSummary(dto: OrderSummaryDto): OrderSummary {
  return {
    id: dto.id,
    code: dto.code,
    status: dto.status,
    orderType: dto.order_type,
    paymentMethod: dto.payment_method,
    customerId: dto.customer_id,
    customerName: dto.customer_name,
    shopId: dto.shop_id,
    shopName: dto.shop_name,
    itemCount: dto.item_count,
    total: dto.total,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    stalledForMinutes: dto.stalled_for_minutes,
  };
}

export function toOrderDetail(dto: OrderDetailDto): OrderDetail {
  return {
    ...toOrderSummary(dto),
    customerEmail: dto.customer_email,
    customerPhone: dto.customer_phone,
    shopAddress: dto.shop_address,
    subTotal: dto.sub_total,
    discountEvent: dto.discount_event,
    discountVoucher: dto.discount_voucher,
    shippingFee: dto.shipping_fee,
    note: dto.note,
    address: dto.address
      ? {
          label: dto.address.label,
          fullAddress: dto.address.full_address,
          lat: dto.address.lat,
          lng: dto.address.lng,
        }
      : null,
    // The API sends [] rather than null for these, but a defensive ?? keeps a
    // partial response from turning the detail screen into a crash.
    items: (dto.items ?? []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      productCode: item.product_code,
      image: item.image,
      quantity: item.quantity,
      subTotal: item.sub_total,
    })),
    vouchers: (dto.vouchers ?? []).map((row) => ({
      voucherId: row.voucher_id,
      code: row.code,
      description: row.description,
    })),
    events: (dto.events ?? []).map((row) => ({
      eventId: row.event_id,
      name: row.name,
      type: row.type,
      discount: row.discount,
    })),
    nextStatuses: dto.next_statuses ?? [],
    reasonRequiredFor: dto.reason_required_for ?? [],
  };
}

export function toTimelineEntry(dto: TimelineEntryDto): TimelineEntry {
  return {
    id: dto.id,
    fromStatus: dto.from_status,
    toStatus: dto.to_status,
    reason: dto.reason,
    actorId: dto.actor_id,
    actorName: dto.actor_name,
    createdAt: dto.created_at,
  };
}

/** The filter state the list screen owns. */
export interface OrderFilters {
  status: string;
  orderType: string;
  paymentMethod: string;
  search: string;
  from: string;
  to: string;
}

export const EMPTY_ORDER_FILTERS: OrderFilters = {
  status: "",
  orderType: "",
  paymentMethod: "",
  search: "",
  from: "",
  to: "",
};

/**
 * How long an order may sit in one status before the list flags it.
 *
 * Two hours is a starting point, not a measured SLA: it is long enough that a
 * normally busy shop does not light up red, and short enough that a genuinely
 * forgotten order surfaces within the same working day. Tune it once there is
 * real throughput data.
 */
export const STALLED_THRESHOLD_MINUTES = 120;

/** Statuses that are finished, and so can never be "stuck". */
const TERMINAL_STATUSES = new Set<string>([
  "COMPLETED",
  "CANCELED",
  "STORE_REJECTED",
]);

export function isStalled(order: OrderSummary): boolean {
  if (TERMINAL_STATUSES.has(order.status)) return false;
  return order.stalledForMinutes >= STALLED_THRESHOLD_MINUTES;
}
