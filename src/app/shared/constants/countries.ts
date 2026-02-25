export interface Country {
  name: string;
  code: string;
  dial_code: string;
}

export const AMERICAN_COUNTRIES: Country[] = [
  { name: 'Argentina', code: 'AR', dial_code: '+54' },
  { name: 'Bolivia', code: 'BO', dial_code: '+591' },
  { name: 'Brasil', code: 'BR', dial_code: '+55' },
  { name: 'Canadá', code: 'CA', dial_code: '+1' },
  { name: 'Chile', code: 'CL', dial_code: '+56' },
  { name: 'Colombia', code: 'CO', dial_code: '+57' },
  { name: 'Costa Rica', code: 'CR', dial_code: '+506' },
  { name: 'Cuba', code: 'CU', dial_code: '+53' },
  { name: 'Ecuador', code: 'EC', dial_code: '+593' },
  { name: 'El Salvador', code: 'SV', dial_code: '+503' },
  { name: 'Estados Unidos', code: 'US', dial_code: '+1' },
  { name: 'Guatemala', code: 'GT', dial_code: '+502' },
  { name: 'Honduras', code: 'HN', dial_code: '+504' },
  { name: 'México', code: 'MX', dial_code: '+52' },
  { name: 'Nicaragua', code: 'NI', dial_code: '+505' },
  { name: 'Panamá', code: 'PA', dial_code: '+507' },
  { name: 'Paraguay', code: 'PY', dial_code: '+595' },
  { name: 'Perú', code: 'PE', dial_code: '+51' },
  { name: 'República Dominicana', code: 'DO', dial_code: '+1-809' },
  { name: 'Uruguay', code: 'UY', dial_code: '+598' },
  { name: 'Venezuela', code: 'VE', dial_code: '+58' }
];
