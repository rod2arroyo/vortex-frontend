export interface UserResponse {
  id: string;
  email: string;
  internal_nick: string | null;
  whatsapp: string | null;
  country: string | null;
  is_onboarded: boolean;
}

export interface UserOnboarding {
  internal_nick: string;
  whatsapp: string;
  country: string;
}

export interface UserUpdate {
  internal_nick?: string;
  whatsapp?: string;
  country?: string;
}
