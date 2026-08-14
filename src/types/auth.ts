export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
}

export type Role = "superadmin" | "admin" | "cashier" | "customer";

export interface Profile {
  id: string;
  name: string;
  username?: string;
  email?: string;
  email_verified: boolean;
  phone?: string;
  phone_verified: boolean;
  photo?: string;
  role: Role;
  status: number;
  sign_in_methods?: SignInMethod[];
  created_at: string;
}

export interface SignInMethod {
  provider: "password" | "google" | "apple" | "phone";
  email?: string;
}
