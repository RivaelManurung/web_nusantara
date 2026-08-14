/**
 * DISKON cuts a percentage off each listed product; BUNDLE gives the reward
 * products away when the buy products are all purchased.
 */
export type EventType = "DISKON" | "BUNDLE";

/** The slice of a product an event row carries. */
export interface EventProductDto {
  id: string;
  name: string;
  code: string;
  price: number;
  unit?: string | null;
  /**
   * The list endpoint returns a bare URL while the product endpoint nests it
   * under `image_path`, so both shapes are accepted.
   */
  image?: string | { image_path?: string | null } | null;
}

export interface EventBundleItemDto {
  id: string;
  product: EventProductDto;
  quantity: number;
}

export interface EventProductDiscountDto {
  id: string;
  product: EventProductDto;
  discount_percent: number;
}

/** An event as the API returns it. */
export interface EventDto {
  id: string;
  name: string;
  type_event: EventType;
  start_date: string;
  end_date: string;
  cover: string;
  /** The API models status as an integer; 1 means active. */
  status: number;
  /**
   * The detail endpoint answers with `event_product` while the list endpoint
   * answers with `event_products`; both are read.
   */
  event_product?: EventProductDiscountDto[] | null;
  event_products?: EventProductDiscountDto[] | null;
  event_bundle_buy?: EventBundleItemDto[] | null;
  event_bundle_reward?: EventBundleItemDto[] | null;
  created_at?: string;
}

/** The shape the UI works with. */
export interface EventProduct {
  id: string;
  name: string;
  code: string;
  price: number;
  unit: string;
  image: string;
}

export interface EventBundleItem {
  product: EventProduct;
  quantity: number;
}

export interface EventProductDiscount {
  product: EventProduct;
  discountPercent: number;
}

export interface AppEvent {
  id: string;
  name: string;
  typeEvent: EventType;
  startDate: string;
  endDate: string;
  cover: string;
  isActive: boolean;
  /** Only populated for DISKON events. */
  products: EventProductDiscount[];
  /** Only populated for BUNDLE events. */
  bundleBuys: EventBundleItem[];
  bundleRewards: EventBundleItem[];
}

export function toEventProduct(dto: EventProductDto): EventProduct {
  return {
    id: dto.id,
    name: dto.name,
    code: dto.code ?? "",
    price: dto.price ?? 0,
    unit: dto.unit ?? "",
    image: imageUrlOf(dto.image),
  };
}

export function toAppEvent(dto: EventDto): AppEvent {
  const discounts = dto.event_product ?? dto.event_products ?? [];

  return {
    id: dto.id,
    name: dto.name,
    typeEvent: dto.type_event,
    startDate: dto.start_date,
    endDate: dto.end_date,
    cover: dto.cover,
    isActive: dto.status === 1,
    products: discounts.map((item) => ({
      product: toEventProduct(item.product),
      discountPercent: item.discount_percent ?? 0,
    })),
    bundleBuys: (dto.event_bundle_buy ?? []).map(toBundleItem),
    bundleRewards: (dto.event_bundle_reward ?? []).map(toBundleItem),
  };
}

function toBundleItem(dto: EventBundleItemDto): EventBundleItem {
  return {
    product: toEventProduct(dto.product),
    quantity: dto.quantity ?? 1,
  };
}

function imageUrlOf(image: EventProductDto["image"]): string {
  if (!image) return "";
  return typeof image === "string" ? image : (image.image_path ?? "");
}

/** What the form sends; the API's JSON-in-multipart encoding lives in `api.ts`. */
export interface EventInput {
  name: string;
  typeEvent: EventType;
  /** ISO 8601, as the backend stores them. */
  startDate: string;
  endDate: string;
  products: { productId: string; discountPercent: number }[];
  bundleBuys: { productId: string; quantity: number }[];
  bundleRewards: { productId: string; quantity: number }[];
  /** Absent when editing without replacing the cover. */
  cover?: File | null;
}
