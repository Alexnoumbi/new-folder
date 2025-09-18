export type AccountType = 'admin' | 'entreprise';

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface User {
  _id: string;
  email: string;
  typeCompte: AccountType;
  nom?: string;
  prenom?: string;
  entrepriseId?: string;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  typeCompte: AccountType;
  entrepriseId?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
