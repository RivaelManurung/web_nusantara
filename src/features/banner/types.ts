/** A promotional banner as the API returns it. */
export interface BannerDto {
  id: string;
  name: string;
  /** Absolute URL of the uploaded artwork. */
  photo: string;
  description: string;
  /** The API models status as an integer; 1 means active. */
  status: number;
}

/** The shape the UI works with. */
export interface Banner {
  id: string;
  name: string;
  photo: string;
  description: string;
  isActive: boolean;
}

export function toBanner(dto: BannerDto): Banner {
  return {
    id: dto.id,
    name: dto.name,
    photo: dto.photo,
    description: dto.description,
    isActive: dto.status === 1,
  };
}

export interface BannerInput {
  name: string;
  description: string;
  /**
   * Only honoured on create; the backend rejects a status change through the
   * edit endpoint, which is what `/banner/:id/edit-status` is for.
   */
  isActive?: boolean;
  /** Absent when editing without replacing the artwork. */
  image?: File | null;
}
