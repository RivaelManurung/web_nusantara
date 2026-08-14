/**
 * The shop a cashier is currently working in.
 *
 * These endpoints live under `/cashier` and answer for the signed-in account,
 * so nothing here takes a shop from the admin-side `/shop` list. Note the API's
 * spelling of longitude, `lang`, which is normalised to `lng` at the boundary.
 */

export interface AssignedShopDto {
  id: string;
  name: string;
}

export interface AssignedShop {
  id: string;
  name: string;
}

export function toAssignedShop(dto: AssignedShopDto): AssignedShop {
  return { id: dto.id, name: dto.name };
}

export interface ActiveShopDto {
  id: string;
  name: string;
  cover: string | null;
  description: string | null;
  full_address: string;
  lat: number | string;
  lang: number | string;
  /** The API models status as an integer; 1 means active. */
  status: number;
  shop_images?: string[] | null;
}

export interface ActiveShop {
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

export function toActiveShop(dto: ActiveShopDto): ActiveShop {
  return {
    id: dto.id,
    name: dto.name,
    cover: dto.cover || null,
    description: dto.description ?? "",
    fullAddress: dto.full_address ?? "",
    lat: toNumber(dto.lat),
    lng: toNumber(dto.lang),
    isActive: dto.status === 1,
    images: dto.shop_images ?? [],
  };
}

export interface ShopProductDto {
  id: string;
  name: string;
  image: string | null;
  code: string | null;
  price: number | null;
  unit: string | null;
  stock: number | null;
  description: string | null;
  status: number;
  type_product?: { id?: string; name?: string } | null;
  product_images?: string[] | null;
}

export interface ShopProduct {
  id: string;
  name: string;
  coverImage: string | null;
  code: string;
  price: number | null;
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
    code: dto.code ?? "",
    price: dto.price ?? null,
    unit: dto.unit ?? "",
    stock: dto.stock ?? 0,
    description: dto.description ?? "",
    isActive: dto.status === 1,
    typeProductName: dto.type_product?.name ?? "-",
    images: dto.product_images ?? [],
  };
}

function toNumber(value: number | string | null | undefined): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  return parsed == null || Number.isNaN(parsed) ? 0 : parsed;
}
