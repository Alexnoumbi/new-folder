import api from './api';
import { SecurityAlert, SecurityStatus, ComplianceStatus, PortfolioStats, SystemInfo } from '../types/admin.types';

export interface AdminStats {
  totalEntreprises: number;
  utilisateursActifs: number;
  kpiValides: number;
  alertes: number;
  evolutionEntreprises: Array<{
    date: string;
    count: number;
  }>;
  activiteRecente: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
  }>;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  resource: string;
  status: 'success' | 'error' | 'warning';
  timestamp: string;
}

export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const response = await api.get('/admin/stats');
    return response.data.data; // Accéder à la propriété data dans la réponse
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques admin:', error);
    throw error;
  }
};

export const getRecentActivity = async (): Promise<AdminStats['activiteRecente']> => {
  try {
    const response = await api.get('/admin/activity');
    return response.data.data; // Accéder à la propriété data dans la réponse
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité récente:', error);
    throw error;
  }
};

export const getAuditLogs = async (): Promise<AuditLog[]> => { throw new Error('getAuditLogs indisponible'); };
export const getSecurityAlerts = async (): Promise<SecurityAlert[]> => {
  const response = await api.get('/admin/security/alerts');
  return response.data;
};
export const getSecurityStatus = async (): Promise<SecurityStatus> => {
  const response = await api.get('/admin/security/status');
  return response.data;
};
export const getComplianceStatus = async (): Promise<ComplianceStatus> => {
  const response = await api.get('/admin/compliance/status');
  return response.data;
};
export const getPortfolioStats = async (): Promise<PortfolioStats> => {
  const response = await api.get('/admin/portfolio/stats');
  return response.data;
};
export const getSystemInfo = async (): Promise<SystemInfo> => {
  const response = await api.get('/admin/system');
  return response.data;
};
