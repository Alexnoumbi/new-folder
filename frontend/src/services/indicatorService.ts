import api from './api';

export interface Indicator {
  _id: string;
  conventionId: string;
  name: string;
  description: string;
  type: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  status: 'ACTIVE' | 'INACTIVE';
  submissions: Array<{
    value: number;
    submittedAt: string;
    submittedBy: string;
    status: 'PENDING' | 'VALIDATED' | 'REJECTED';
    comment?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const indicatorService = {
  createIndicator: async (indicatorData: any) => {
    const response = await api.post('/indicators', indicatorData);
    return response.data;
  },

  getIndicatorsByConvention: async (conventionId: string): Promise<Indicator[]> => {
    const response = await api.get(`/indicators/convention/${conventionId}`);
    return response.data;
  },

  getIndicatorsReport: async (conventionId: string) => {
    const response = await api.get(`/indicators/convention/${conventionId}/report`);
    return response.data;
  },

  getIndicatorDetails: async (id: string): Promise<Indicator> => {
    const response = await api.get(`/indicators/${id}`);
    return response.data;
  },

  updateIndicator: async (id: string, indicatorData: any) => {
    const response = await api.put(`/indicators/${id}`, indicatorData);
    return response.data;
  },

  submitIndicatorValue: async (id: string, value: number, comment?: string) => {
    const response = await api.post(`/indicators/${id}/submit`, { value, comment });
    return response.data;
  },

  validateIndicatorSubmission: async (id: string, submissionId: string, status: 'VALIDATED' | 'REJECTED', comment?: string) => {
    const response = await api.patch(`/indicators/${id}/submissions/${submissionId}/validate`, { status, comment });
    return response.data;
  },

  getIndicatorHistory: async (id: string) => {
    const response = await api.get(`/indicators/${id}/history`);
    return response.data;
  }
};

export default indicatorService; 