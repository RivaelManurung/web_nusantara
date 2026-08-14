import { api } from "@/lib/api/client";
import { tokenStorage } from "@/lib/auth/token-storage";
import type { Profile, SignInMethod, TokenPair } from "@/types/auth";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SocialLoginPayload {
  id_token: string;
  nonce?: string;
  name?: string;
}

export interface PhoneStartPayload {
  phone: string;
}

export interface PhoneStartResult {
  expires_in_seconds: number;
  resend_in_seconds: number;
}

export interface PhoneVerifyPayload {
  phone: string;
  code: string;
  name?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirmation_password: string;
}

export const authApi = {
  login: (payload: LoginPayload) => api.post<TokenPair>("/auth/login", payload),

  loginWithGoogle: (payload: SocialLoginPayload) =>
    api.post<TokenPair>("/auth/google", payload),

  loginWithApple: (payload: SocialLoginPayload) =>
    api.post<TokenPair>("/auth/apple", payload),

  requestPhoneCode: (payload: PhoneStartPayload) =>
    api.post<PhoneStartResult>("/auth/phone/request", payload),

  verifyPhoneCode: (payload: PhoneVerifyPayload) =>
    api.post<TokenPair>("/auth/phone/verify", payload),

  profile: () => api.get<Profile>("/auth/profile"),

  signInMethods: () => api.get<SignInMethod[]>("/auth/methods"),

  changePassword: (payload: ChangePasswordPayload) =>
    api.patch<null>("/auth/password", payload),

  logout: () =>
    api.post<null>("/auth/logout", {
      refresh_token: tokenStorage.refreshToken ?? undefined,
    }),
};
