import api from './api';
import { AuditLog } from '../types/audit.types';

export interface AuditLogFilters {
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export const getAuditLogs = async (filters?: AuditLogFilters): Promise<AuditLog[]> => {
  try {
    const response = await api.get('/audit/logs', {
      params: filters,
      timeout: 10000
    });
    const payload = response.data;
    const items = Array.isArray(payload) ? payload : (payload?.data ?? []);
    return items.map((log: any) => ({
      ...log,
      user: log.userDetails
    }));
  } catch (error: any) {
    console.error('Erreur lors de la récupération des logs d\'audit:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des logs d\'audit');
  }
};

export const getAuditLogDetails = async (logId: string): Promise<AuditLog> => {
  try {
    const response = await api.get(`/audit/logs/${logId}`);
    const payload = response.data?.data ?? response.data;
    return {
      ...payload,
      user: payload?.userDetails
    };
  } catch (error: any) {
    console.error('Erreur lors de la récupération du détail du log:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du détail du log');
  }
};

export const exportAuditLogs = async (filters?: AuditLogFilters): Promise<Blob> => {
  const response = await api.get('/audit/logs/export', {
    params: filters,
    responseType: 'blob'
  });
  return response.data;
};
export default class auditService {
}