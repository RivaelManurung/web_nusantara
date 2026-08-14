/**
 * Which shop an admin is currently managing.
 *
 * The API exposes three related shapes: the short list used to populate the
 * switcher, the full record of the shop that is active, and that shop's
 * products. Each arrives snake_cased and with `status` as an integer, so the
 * mapping to the view model happens here rather than in components.
 */

/** One entry of `GET /cashier/shop-names`. */
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

/** `GET /cashier/shop-cashier/:shopId`. */
export interface ActiveShopDto {
  id: string;
  name: string;
  cover?: string;
  description?: string;
  full_address?: string;
  lat?: number | string;
  /** The backend's spelling of longitude; kept as-is on the wire. */
  lang?: number | string;
  status: number;
  shop_images?: string[];
}

export interface ActiveShop {
  id: string;
  name: string;
  cover?: string;
  description?: string;
  fullAddress?: string;
  lat?: number | string;
  longitude?: number | string;
  isActive: boolean;
  shopImages: string[];
}

export function toActiveShop(dto: ActiveShopDto): ActiveShop {
  return {
    id: dto.id,
    name: dto.name,
    cover: dto.cover,
    description: dto.description,
    fullAddress: dto.full_address,
    lat: dto.lat,
    longitude: dto.lang,
    isActive: dto.status === 1,
    shopImages: dto.shop_images ?? [],
  };
}

/** One entry of `GET /cashier/cashier-shop-product/:shopId`. */
export interface ShopProductDto {
  id: string;
  name: string;
  image?: string;
  code?: string;
  price?: number | string;
  unit?: string;
  stock?: number;
  description?: string;
  status: number;
  type_product?: string;
  product_images?: string[];
}

export interface ShopProduct {
  id: string;
  name: string;
  /** The wire calls this `image`; renamed so it reads the same as other features. */
  coverImage?: string;
  code?: string;
  price?: number | string;
  unit?: string;
  stock?: number;
  description?: string;
  isActive: boolean;
  typeProduct?: string;
  productImages: string[];
}

export function toShopProduct(dto: ShopProductDto): ShopProduct {
  return {
    id: dto.id,
    name: dto.name,
    coverImage: dto.image,
    code: dto.code,
    price: dto.price,
    unit: dto.unit,
    stock: dto.stock,
    description: dto.description,
    isActive: dto.status === 1,
    typeProduct: dto.type_product,
    productImages: dto.product_images ?? [],
  };
}
