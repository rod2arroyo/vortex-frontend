// Datos que recibes del Backend (UserResponse)
export interface User {
  id: string;
  email: string; // Asumo que viene de UserBase
  full_name?: string; // Asumo que viene de UserBase
  avatar_url?: string; // Asumo que viene de UserBase
  google_id?: string;
  role: 'USER' | 'ADMIN';

  // Campos editables
  internal_nick?: string;
  country?: string;
  phone_country_code?: string;
  phone_number?: string;
  discord_id?: string;

  // Propiedad computada del backend
  is_onboarded: boolean;
}

// Datos para el POST /onboarding (UserOnboarding)
export interface UserOnboardingRequest {
  internal_nick: string;
  country: string;
  phone_country_code: string; // Ej: "+51"
  phone_number: string;       // Ej: "999888777"
  discord_id: string;
}

// Datos para el PATCH /update (UserUpdate)
// Partial hace que todos los campos de Onboarding sean opcionales
export interface UserUpdateRequest extends Partial<UserOnboardingRequest> {}
