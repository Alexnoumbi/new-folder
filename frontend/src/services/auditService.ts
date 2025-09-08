import api from './api';

export interface AuditLog {
  _id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  timestamp: string;
  userDetails?: {
    name: string;
    email: string;
  };
}

export interface AuditLogFilters {
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export const getAuditLogs = async (filters?: AuditLogFilters): Promise<AuditLog[]> => {
  const response = await api.get('/admin/audit-logs', { params: filters });
  return response.data;
};

export const getAuditLogDetails = async (logId: string): Promise<AuditLog> => {
  const response = await api.get(`/admin/audit-logs/${logId}`);
  return response.data;
};

export const exportAuditLogs = async (filters?: AuditLogFilters): Promise<Blob> => {
  const response = await api.get('/admin/audit-logs/export', {
    params: filters,
    responseType: 'blob'
  });
  return response.data;
};
export default class auditService {
}