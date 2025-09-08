export interface User {
  _id: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  nom: string;
  prenom: string;
  typeCompte: 'admin' | 'entreprise';
  telephone?: string;
  entrepriseId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  company?: string;
  position?: string;
  department?: string;
  manager?: string;
  status?: string;
  lastLogin?: string;
  createdAt?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  darkMode?: boolean;
  language?: string;
}

export type UserRole = User['role'];

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  location?: string;
  company?: string;
  position?: string;
  department?: string;
  manager?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
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
  typeCompte: User['typeCompte'];
  telephone?: string;
  entrepriseId?: string;
}

export interface SystemInfo {
  version: string;
  uptime: number;
  memory: {
    total: number;
    used: number;
    free: number;
  };
  cpu: {
    model: string;
    cores: number;
    usage: number;
  };
}
