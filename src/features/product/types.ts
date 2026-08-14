/** An image row as the API nests it, wrapped around the stored path. */
export interface ImageDto {
  image_path?: string | null;
}

/**
 * A catalogue product as the API returns it.
 *
 * The product endpoints serialise the GORM entity directly rather than a
 * response DTO, so relations arrive as nested objects (`image.image_path`,
 * `type_product.name`) instead of the flattened strings the cashier endpoints
 * use.
 */
export interface ProductDto {
  id: string;
  name: string;
  image?: ImageDto | null;
  code: string;
  price: number;
  unit: string;
  description: string;
  /** The API models status as an integer; 1 means active. */
  status: number;
  type_product?: { id: string; name: string } | null;
  product_images?: Array<{ image?: ImageDto | null }> | null;
  created_by?: { name?: string } | null;
  created_at: string;
}

/** The shape the UI works with. */
export interface Product {
  id: string;
  name: string;
  coverImage: string | null;
  code: string;
  price: number;
  unit: string;
  description: string;
  isActive: boolean;
  typeProductId: string | null;
  typeProductName: string;
  /** Gallery image URLs, cover excluded. */
  images: string[];
  createdBy: string;
  createdAt: string;
}

export function toProduct(dto: ProductDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    coverImage: dto.image?.image_path ?? null,
    code: dto.code,
    price: dto.price,
    unit: dto.unit,
    description: dto.description,
    isActive: dto.status === 1,
    typeProductId: dto.type_product?.id ?? null,
    typeProductName: dto.type_product?.name ?? "-",
    images: (dto.product_images ?? [])
      .map((entry) => entry.image?.image_path)
      .filter((path): path is string => Boolean(path)),
    createdBy: dto.created_by?.name ?? "-",
    createdAt: dto.created_at,
  };
}

/**
 * One slot in the gallery editor.
 *
 * Existing images are identified by URL because the backend has no per-image
 * delete endpoint: the only way to drop one is to resend the gallery it should
 * end up as.
 */
export type GalleryItem =
  { kind: "existing"; url: string } | { kind: "new"; file: File };

export interface ProductInput {
  name: string;
  code: string;
  price: number;
  unit: string;
  description: string;
  typeProductId: string;
  /** Absent when editing without replacing the cover. */
  cover?: File | null;
  /** The gallery as it should end up. */
  gallery: GalleryItem[];
  /**
   * Edit only. False leaves the stored gallery untouched; sending the whole
   * gallery on every save would re-upload images that never changed.
   */
  galleryChanged?: boolean;
}
