import api from './api';
import { LoginCredentials, RegisterData, AuthResponse } from '../types/auth.types';
import type { User } from '../types/user.types';

export const loadEnterpriseDashboard = async (user: User) => {
  if (!user?.id) {
    console.log('Cannot load enterprise data: invalid user or missing ID');
    return null;
  }

  try {
    const [dashboardData] = await Promise.all([
      api.get(`/dashboard/enterprise/${user.id}`)
    ]);

    localStorage.setItem('enterpriseDashboard', JSON.stringify(dashboardData.data));

    const [messagesData, reportsData] = await Promise.all([
      api.get(`/messages/${user.id}`),
      api.get(`/reports/enterprise/${user.id}`)
    ]);

    localStorage.setItem('enterpriseMessages', JSON.stringify(messagesData.data));
    localStorage.setItem('enterpriseReports', JSON.stringify(reportsData.data));

    return {
      dashboard: dashboardData.data,
      messages: messagesData.data,
      reports: reportsData.data
    };
  } catch (error) {
    console.error('Error loading enterprise data:', error);
    return {
      dashboard: JSON.parse(localStorage.getItem('enterpriseDashboard') || 'null'),
      messages: JSON.parse(localStorage.getItem('enterpriseMessages') || 'null'),
      reports: JSON.parse(localStorage.getItem('enterpriseReports') || 'null')
    };
  }
};

export const login = async ({ email, password }: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post(`/auth/login`, { email, password });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur de connexion');
    }

    const serverData = response.data.data;
    if (!serverData?.user?.id) {
      throw new Error('Données utilisateur invalides');
    }

    const user: User = {
      id: serverData.user.id,
      email: serverData.user.email,
      nom: serverData.user.nom,
      prenom: serverData.user.prenom,
      role: serverData.user.role as User['role'],
      typeCompte: serverData.user.typeCompte,
      status: serverData.user.status || 'active',
      telephone: serverData.user.telephone,
      entrepriseId: serverData.user.entrepriseId
    };

    try { localStorage.setItem('user', JSON.stringify(user)); } catch {}

    if (user.typeCompte === 'entreprise') {
      await loadEnterpriseDashboard(user).catch(() => {});
    }

    return { user };
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Erreur de serveur');
    } else if (error.request) {
      throw new Error('Impossible de contacter le serveur');
    } else {
      throw new Error(error.message || 'Erreur de connexion');
    }
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post(`/auth/register`, data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de l\'inscription');
    }

    const serverData = response.data.data;
    const user: User = {
      id: serverData.user.id,
      email: serverData.user.email,
      nom: serverData.user.nom,
      prenom: serverData.user.prenom,
      role: serverData.user.role as User['role'],
      typeCompte: serverData.user.typeCompte || 'entreprise',
      status: 'active',
      telephone: data.telephone,
      entrepriseId: serverData.user.entrepriseId
    };

    return { user };
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try { localStorage.removeItem('user'); } catch {}
  return;
};

export const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    return null;
  }
};
