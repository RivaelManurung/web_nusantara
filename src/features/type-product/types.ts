/** A product category as the API returns it. */
export interface TypeProductDto {
  id: string;
  name: string;
  image: string;
  /** The API models status as an integer; 1 means active. */
  status: number;
}

/** The shape the UI works with. */
export interface TypeProduct {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
}

export function toTypeProduct(dto: TypeProductDto): TypeProduct {
  return {
    id: dto.id,
    name: dto.name,
    image: dto.image,
    isActive: dto.status === 1,
  };
}

export interface TypeProductInput {
  name: string;
  /** Absent when editing without replacing the picture. */
  image?: File | null;
}
