import api from './api';

export interface Convention {
  _id: string;
  enterpriseId: string;
  type: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  startDate: string;
  endDate: string;
  documents: Array<{
    name: string;
    url: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const conventionService = {
  createConvention: async (conventionData: any) => {
    const response = await api.post('/conventions', conventionData);
    return response.data;
  },

  getConventionsByEnterprise: async (enterpriseId: string): Promise<Convention[]> => {
    const response = await api.get(`/conventions/enterprise/${enterpriseId}`);
    return response.data;
  },

  getActiveConventions: async (enterpriseId: string): Promise<Convention[]> => {
    const response = await api.get(`/conventions/enterprise/${enterpriseId}/active`);
    return response.data;
  },

  updateConvention: async (id: string, conventionData: any) => {
    const response = await api.put(`/conventions/${id}`, conventionData);
    return response.data;
  },

  updateConventionStatus: async (id: string, status: string) => {
    const response = await api.patch(`/conventions/${id}/status`, { status });
    return response.data;
  },

  addDocumentToConvention: async (id: string, documentData: any) => {
    const response = await api.post(`/conventions/${id}/documents`, documentData);
    return response.data;
  },

  getConventionHistory: async (id: string) => {
    const response = await api.get(`/conventions/${id}/history`);
    return response.data;
  },

  getConventionSummary: async (id: string) => {
    const response = await api.get(`/conventions/${id}/summary`);
    return response.data;
  }
};

export default conventionService; 