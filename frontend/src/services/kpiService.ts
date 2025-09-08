import api from './api';
import { KPI, KPIHistory } from '../types/admin.types';

export interface KPISubmission {
  kpiId: string;
  value: number;
  comment?: string;
  enterpriseId: string;
}

export interface KPIFormData {
  name: string;
  description?: string;
  type: 'NUMERIC' | 'PERCENTAGE' | 'CURRENCY' | 'BOOLEAN';
  unit: string;
  targetValue: number;
  minValue?: number;
  maxValue?: number;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  enterprise?: string;
}

const kpiService = {
  getKPIs: async (): Promise<KPI[]> => {
    const response = await api.get('/admin/kpis');
    return response.data;
  },

  createKPI: async (data: KPIFormData): Promise<KPI> => {
    const response = await api.post('/admin/kpis', data);
    return response.data;
  },

  updateKPI: async (id: string, data: Partial<KPIFormData>): Promise<KPI> => {
    const response = await api.put(`/admin/kpis/${id}`, data);
    return response.data;
  },

  deleteKPI: async (id: string): Promise<void> => {
    await api.delete(`/admin/kpis/${id}`);
  },

  getKPIHistory: async (kpiId: string, period: string = 'month'): Promise<KPIHistory[]> => {
    const response = await api.get(`/kpis/${kpiId}/history`, {
      params: { period }
    });
    return response.data;
  },

  getKPIsByEnterprise: async (enterpriseId: string): Promise<KPI[]> => {
    const response = await api.get(`/kpis/enterprise/${enterpriseId}`);
    return response.data;
  },

  submitKPIValue: async (submission: KPISubmission) => {
    const response = await api.post(`/kpis/${submission.kpiId}/submit`, submission);
    return response.data;
  },

  validateKPISubmission: async (kpiId: string, submissionId: string, status: 'validated' | 'rejected', comment?: string) => {
    const response = await api.put(`/kpis/${kpiId}/submissions/${submissionId}`, {
      status,
      comment
    });
    return response.data;
  },

  getKPIOverview: async (enterpriseId: string) => {
    const response = await api.get(`/kpis/enterprise/${enterpriseId}/overview`);
    return response.data;
  }
};

export const {
  getKPIs,
  createKPI,
  updateKPI,
  deleteKPI,
  getKPIHistory,
  getKPIsByEnterprise,
  submitKPIValue,
  validateKPISubmission,
  getKPIOverview
} = kpiService;

export default kpiService;
