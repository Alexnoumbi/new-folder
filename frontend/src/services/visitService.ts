import api from './api';

export interface Visit {
  _id: string;
  enterpriseId: string;
  inspectorId?: string;
  scheduledAt: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  type: 'REGULAR' | 'FOLLOW_UP' | 'EMERGENCY';
  report?: {
    content: string;
    files: Array<{
      name: string;
      url: string;
    }>;
    submittedAt: string;
    submittedBy: string;
    outcome: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_FOLLOW_UP';
  };
}

export interface VisitRequest {
  enterpriseId: string;
  scheduledAt: Date;
  type: Visit['type'];
  comment?: string;
}

const visitService = {
  getVisitsByEnterprise: async (enterpriseId: string): Promise<Visit[]> => {
    const response = await api.get(`/visites/enterprise/${enterpriseId}`);
    // Normaliser la réponse
    return response.data.data || response.data || [];
  },

  requestVisit: async (request: VisitRequest): Promise<Visit> => {
    const response = await api.post('/visites/request', request);
    return response.data;
  },

  cancelVisit: async (visitId: string, reason: string): Promise<Visit> => {
    const response = await api.put(`/visites/${visitId}/cancel`, { reason });
    return response.data;
  },

  downloadVisitReport: async (visitId: string): Promise<Blob> => {
    const response = await api.get(`/visites/${visitId}/report/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  submitVisitReport: async (
    visitId: string,
    payload: {
      content: string;
      outcome: Visit['report'] extends infer R
        ? R extends { outcome: infer O }
          ? O
          : 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_FOLLOW_UP'
        : 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_FOLLOW_UP';
      reporterName?: string;
      enterpriseData?: any;
    }
  ): Promise<Visit> => {
    const response = await api.post(`/visites/${visitId}/report`, payload);
    return response.data;
  },

  getUpcomingVisits: async (enterpriseId: string): Promise<Visit[]> => {
    const response = await api.get(`/visites/enterprise/${enterpriseId}/upcoming`);
    return response.data;
  },

  getPastVisits: async (enterpriseId: string): Promise<Visit[]> => {
    const response = await api.get(`/visites/enterprise/${enterpriseId}/past`);
    return response.data;
  }
};

export default visitService;
