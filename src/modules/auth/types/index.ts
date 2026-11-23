export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferredCurrency: string;
  preferredLanguage: string;
  preferredTheme: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  isUnlocked: boolean; // True si desbloqueó con PIN o contraseña
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  user?: UserProfile;
}
