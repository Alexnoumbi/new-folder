import axios from 'axios';

const API_URL = 'http://localhost:5000/api/indicators';

export interface Indicator {
  _id: string;
  name: string;
  code: string;
  description?: string;
  type: 'OUTCOME' | 'OUTPUT' | 'ACTIVITY' | 'IMPACT' | 'QUANTITATIVE' | 'QUALITATIVE';
  framework?: string | {
    _id: string;
    name: string;
    description?: string;
  };
  linkedKPIs?: Array<string | {
    _id: string;
    nom: string;
    code: string;
    valeurCible?: number;
    valeurActuelle?: number;
    unite?: string;
  }>;
  entreprise: string | {
    _id: string;
    nom?: string;
    name?: string;
    identification?: {
      nomEntreprise?: string;
    };
  };
  unit: string;
  baseline: number;
  target: number;
  current: number;
  targetDate?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  dataSource?: string;
  responsible?: string;
  history?: Array<{
    date: string;
    value: number;
    comment?: string;
    recordedBy?: {
      _id: string;
      nom: string;
      prenom: string;
    };
  }>;
  status: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'NOT_STARTED';
  verificationMeans?: string[];
  assumptions?: string[];
  createdBy?: string;
  updatedBy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IndicatorStats {
  total: number;
  byType: {
    OUTCOME: number;
    OUTPUT: number;
    ACTIVITY: number;
    IMPACT: number;
  };
  byStatus: {
    ON_TRACK: number;
    AT_RISK: number;
    OFF_TRACK: number;
    NOT_STARTED: number;
  };
  averageProgress: number;
}

const indicatorService = {
  // Obtenir tous les indicateurs
  getAll: async (params?: {
    entrepriseId?: string;
    frameworkId?: string;
    type?: string;
    status?: string;
  }): Promise<Indicator[]> => {
    const response = await axios.get(API_URL, { params });
    return response.data.data || response.data || [];
  },

  // Obtenir un indicateur par ID
  getById: async (id: string): Promise<Indicator> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
  },

  // Créer un indicateur
  create: async (data: Partial<Indicator>): Promise<Indicator> => {
    const response = await axios.post(API_URL, data);
    return response.data.data;
  },

  // Mettre à jour un indicateur
  update: async (id: string, data: Partial<Indicator>): Promise<Indicator> => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data.data;
  },

  // Supprimer un indicateur
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  // Ajouter une valeur à l'historique
  addValue: async (id: string, value: number, comment?: string): Promise<Indicator> => {
    const response = await axios.post(`${API_URL}/${id}/values`, { value, comment });
    return response.data.data;
  },

  // Obtenir les indicateurs d'un cadre
  getByFramework: async (frameworkId: string): Promise<Indicator[]> => {
    const response = await axios.get(`${API_URL}/framework/${frameworkId}`);
    return response.data.data || [];
  },

  // Obtenir les indicateurs liés à un KPI
  getLinkedToKPI: async (kpiId: string): Promise<Indicator[]> => {
    const response = await axios.get(`${API_URL}/kpi/${kpiId}/linked`);
    return response.data.data || [];
  },

  // Lier un indicateur à un KPI
  linkToKPI: async (indicatorId: string, kpiId: string): Promise<Indicator> => {
    const response = await axios.post(`${API_URL}/${indicatorId}/link-kpi`, { kpiId });
    return response.data.data;
  },

  // Délier un indicateur d'un KPI
  unlinkFromKPI: async (indicatorId: string, kpiId: string): Promise<void> => {
    await axios.post(`${API_URL}/${indicatorId}/unlink-kpi`, { kpiId });
  },

  // Obtenir les statistiques
  getStats: async (entrepriseId?: string): Promise<IndicatorStats> => {
    const response = await axios.get(`${API_URL}/stats`, {
      params: { entrepriseId }
    });
    return response.data.data;
  }
};

export default indicatorService;
