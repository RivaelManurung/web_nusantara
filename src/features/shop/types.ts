/**
 * Shop DTOs.
 *
 * Two field names are worth knowing before reading anything else:
 * the API spells longitude `lang`, and it nests a shop's staff and stock under
 * `shop_cashier` / `shop_product`. Both are normalised here so nothing
 * downstream has to remember it.
 */

export interface ShopCashierDto {
  id: string;
  name: string;
  username?: string;
  email?: string;
  photo?: string | null;
  status?: number;
}

export interface ShopProductDto {
  id: string;
  name: string;
  code?: string;
  price?: number | null;
  stock?: number | null;
  status?: number;
  image?: { image_path?: string } | null;
}

export interface ShopDto {
  id: string;
  name: string;
  cover: string | null;
  description: string;
  full_address: string;
  lat: number | string;
  /** The API's spelling of longitude. */
  lang: number | string;
  /** The API models status as an integer; 1 means active. */
  status: number;
  created_by?: { name?: string } | string | null;
  created_at: string;
  shop_images?: string[] | null;
  shop_product?: ShopProductDto[] | null;
  shop_cashier?: ShopCashierDto[] | null;
}

export interface ShopCashierRef {
  id: string;
  name: string;
}

/** A product attached to a shop, with the per-shop stock and price. */
export interface ShopProductLine {
  id: string;
  name: string;
  stock: number;
  /** Null means "use the product's own price". */
  price: number | null;
  isActive: boolean;
}

export interface Shop {
  id: string;
  name: string;
  cover: string | null;
  description: string;
  fullAddress: string;
  lat: number;
  lng: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  /** Gallery image URLs. */
  gallery: string[];
  products: ShopProductLine[];
  cashiers: ShopCashierRef[];
}

export function toShop(dto: ShopDto): Shop {
  return {
    id: dto.id,
    name: dto.name,
    cover: dto.cover || null,
    description: dto.description ?? "",
    fullAddress: dto.full_address ?? "",
    lat: toNumber(dto.lat),
    lng: toNumber(dto.lang),
    isActive: dto.status === 1,
    createdBy: creatorName(dto.created_by),
    createdAt: dto.created_at,
    gallery: dto.shop_images ?? [],
    products: (dto.shop_product ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock ?? 0,
      price: product.price ?? null,
      isActive: product.status !== 0,
    })),
    cashiers: (dto.shop_cashier ?? []).map((cashier) => ({
      id: cashier.id,
      name: cashier.name,
    })),
  };
}

/**
 * The little a picker needs to know about a catalogue product.
 *
 * Declared structurally rather than importing `Product`, so the shop form can
 * be handed rows from any source without dragging the product feature's full
 * view model through this one.
 */
export interface ProductPick {
  id: string;
  name: string;
  code?: string;
  /** Catalogue price, shown as the placeholder when a shop does not override it. */
  price?: number;
}

/** One row of the form's product table, before it becomes the wire payload. */
export interface ShopProductInput {
  productId: string;
  name: string;
  stock: number;
  price: number | null;
  isActive: boolean;
}

/** An image already stored on the shop, or a newly picked file. */
export type GalleryItem =
  { kind: "existing"; url: string } | { kind: "new"; file: File; url: string };

export interface ShopInput {
  name: string;
  description: string;
  fullAddress: string;
  lat: number;
  lng: number;
  cashierIds: string[];
  products: ShopProductInput[];
  /** Absent when editing without replacing the cover. */
  cover?: File | null;
  gallery: GalleryItem[];
  /** True when an existing gallery image was removed, which forces a full replace. */
  hasRemovedGallery: boolean;
}

function toNumber(value: number | string | null | undefined): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  return parsed == null || Number.isNaN(parsed) ? 0 : parsed;
}

function creatorName(
  value: { name?: string } | string | null | undefined,
): string {
  if (typeof value === "string") return value;
  return value?.name ?? "-";
}
