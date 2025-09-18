import { User as BaseUser } from './user.types';

export type User = BaseUser;

export interface ServerAuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      id: string;
      email: string;
      nom: string;
      prenom: string;
      role: string;
      typeCompte: 'admin' | 'entreprise';
      status?: 'active' | 'inactive' | 'pending';
      telephone?: string;
      entreprise?: string;
    };
  };
}

export interface AuthResponse {
  user: User;
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
  typeCompte?: 'admin' | 'entreprise';
  telephone?: string;
}
