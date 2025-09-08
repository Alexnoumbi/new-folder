import api from './api';
import { Report } from '../types/admin.types';

export const getReports = async (): Promise<Report[]> => {
  const response = await api.get('/reports');
  return response.data;
};

export const generateReport = async (params: {
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  startDate: Date | null;
  endDate: Date | null;
  format: 'pdf' | 'excel';
  includeCharts: boolean;
}): Promise<Report> => {
  const response = await api.post('/reports/generate', params);
  return response.data;
};

export const downloadReport = async (reportId: string): Promise<Blob> => {
  const response = await api.get(`/reports/${reportId}/download`, {
    responseType: 'blob'
  });
  return response.data;
};

export const deleteReport = async (reportId: string): Promise<void> => {
  await api.delete(`/reports/${reportId}`);
};
