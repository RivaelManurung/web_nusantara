import type { Role } from "@/types/auth";

/** A cashier account as the API returns it. */
export interface CashierDto {
  id: string;
  name: string;
  username: string;
  email: string;
  photo: string | null;
  /** The API models status as an integer; 1 means active. */
  status: number;
  role: Role;
  created_at: string;
}

/** The shape the UI works with. */
export interface Cashier {
  id: string;
  name: string;
  username: string;
  email: string;
  photo: string | null;
  isActive: boolean;
  role: Role;
  createdAt: string;
}

export function toCashier(dto: CashierDto): Cashier {
  return {
    id: dto.id,
    name: dto.name,
    username: dto.username,
    email: dto.email,
    photo: dto.photo || null,
    isActive: dto.status === 1,
    role: dto.role,
    createdAt: dto.created_at,
  };
}

/**
 * What the form submits.
 *
 * `email` and `password` are only accepted on create: the edit endpoint ignores
 * them and the old modal disabled the email input in edit mode, so sending them
 * again would suggest a rename that never happens.
 */
export interface CashierInput {
  name: string;
  username: string;
  email?: string;
  password?: string;
  /** Absent when editing without replacing the photo. */
  image?: File | null;
}
