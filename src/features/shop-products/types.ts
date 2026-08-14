/** A shop the signed-in cashier is assigned to, as `/cashier/shop-names` returns it. */
export interface ShopOptionDto {
  id: string;
  name: string;
}

export interface ShopOption {
  id: string;
  name: string;
}

export function toShopOption(dto: ShopOptionDto): ShopOption {
  return { id: dto.id, name: dto.name };
}

/** The active shop, as `/cashier/shop-cashier/:shop_id` returns it. */
export interface ShopSummaryDto {
  id: string;
  name: string;
  cover: string;
  description: string;
  full_address: string;
  lat: number;
  /** The API spells longitude "lang". */
  lang: number;
  status: number;
  shop_images?: string[] | null;
}

export interface ShopSummary {
  id: string;
  name: string;
  cover: string | null;
  description: string;
  fullAddress: string;
  lat: number;
  lng: number;
  isActive: boolean;
  images: string[];
}

export function toShopSummary(dto: ShopSummaryDto): ShopSummary {
  return {
    id: dto.id,
    name: dto.name,
    cover: dto.cover || null,
    description: dto.description,
    fullAddress: dto.full_address,
    lat: dto.lat,
    lng: dto.lang,
    isActive: dto.status === 1,
    images: dto.shop_images ?? [],
  };
}

/**
 * One catalogue product as it is sold in a shop.
 *
 * `price`, `stock` and `status` belong to the shop assignment, while the name,
 * code, unit and images come from the catalogue product behind it. The cashier
 * endpoint flattens both into one row, so `id` is the assignment's id, not the
 * product's.
 */
export interface ShopProductDto {
  id: string;
  name: string;
  image: string;
  code: string;
  price: number;
  unit: string;
  stock: number;
  description: string;
  status: number;
  type_product: string;
  product_images?: string[] | null;
}

export interface ShopProduct {
  id: string;
  name: string;
  coverImage: string | null;
  code: string;
  price: number;
  unit: string;
  stock: number;
  description: string;
  isActive: boolean;
  typeProductName: string;
  images: string[];
}

export function toShopProduct(dto: ShopProductDto): ShopProduct {
  return {
    id: dto.id,
    name: dto.name,
    coverImage: dto.image || null,
    code: dto.code,
    price: dto.price,
    unit: dto.unit,
    stock: dto.stock,
    description: dto.description,
    isActive: dto.status === 1,
    typeProductName: dto.type_product || "-",
    images: dto.product_images ?? [],
  };
}
