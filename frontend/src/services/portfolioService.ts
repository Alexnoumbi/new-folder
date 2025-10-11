import axios from 'axios';

const API_URL = 'http://localhost:5000/api/portfolios';

// Types
export interface Portfolio {
  _id: string;
  name: string;
  description?: string;
  code: string;
  portfolioType: 'PROGRAM' | 'THEME' | 'REGION' | 'DONOR' | 'CUSTOM';
  projects: Array<string | any>;
  objectives: Objective[];
  aggregatedIndicators: AggregatedIndicator[];
  budget: PortfolioBudget;
  period: {
    startDate: string;
    endDate: string;
    fiscalYear?: string;
  };
  donors: Donor[];
  partners: Partner[];
  geographicCoverage: GeographicCoverage[];
  beneficiaries: Beneficiaries;
  risks: Risk[];
  lessonsLearned: LessonLearned[];
  reportingSchedule: ReportSchedule[];
  performance: Performance;
  team: TeamMember[];
  status: 'PLANNING' | 'ACTIVE' | 'CLOSING' | 'CLOSED' | 'ON_HOLD';
  visibility: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'CONFIDENTIAL';
  tags: string[];
  createdBy?: any;
  updatedBy?: any;
  createdAt: string;
  updatedAt: string;
  projectCount?: number;
  budgetExecutionRate?: number;
}

export interface Objective {
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  targetDate?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'AT_RISK';
}

export interface AggregatedIndicator {
  name: string;
  description?: string;
  type: 'SUM' | 'AVERAGE' | 'WEIGHTED_AVERAGE' | 'PERCENTAGE' | 'COUNT';
  sourceIndicators: string[];
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  weight?: number;
  calculationFormula?: string;
}

export interface PortfolioBudget {
  totalBudget: {
    amount: number;
    currency: 'FCFA' | 'USD' | 'EUR';
  };
  allocated: number;
  spent: number;
  committed: number;
  available: number;
  breakdown: Array<{
    project: string;
    allocated: number;
    spent: number;
    percentage: number;
  }>;
}

export interface Donor {
  name: string;
  type: 'BILATERAL' | 'MULTILATERAL' | 'FOUNDATION' | 'PRIVATE' | 'GOVERNMENT' | 'OTHER';
  contribution: {
    amount: number;
    currency: string;
    percentage: number;
  };
  contactPerson?: string;
  email?: string;
  requirements: string[];
}

export interface Partner {
  name: string;
  type: 'IMPLEMENTING' | 'TECHNICAL' | 'FINANCIAL' | 'STRATEGIC';
  role: string;
  projects: string[];
}

export interface GeographicCoverage {
  region: string;
  country?: string;
  province?: string;
  projectCount: number;
}

export interface Beneficiaries {
  direct: {
    target: number;
    reached: number;
    breakdown: Array<{
      category: string;
      count: number;
    }>;
  };
  indirect: {
    target: number;
    estimated: number;
  };
}

export interface Risk {
  description: string;
  category: 'FINANCIAL' | 'OPERATIONAL' | 'STRATEGIC' | 'REPUTATIONAL' | 'COMPLIANCE';
  probability: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedProjects: string[];
  mitigationPlan?: string;
  owner?: string;
  status: 'IDENTIFIED' | 'MONITORING' | 'MITIGATING' | 'CLOSED';
}

export interface LessonLearned {
  title: string;
  description: string;
  category: string;
  source?: string;
  dateIdentified: string;
  recommendations: string[];
  status: 'DOCUMENTED' | 'SHARED' | 'APPLIED';
}

export interface ReportSchedule {
  reportType: string;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL' | 'AD_HOC';
  recipient: string;
  nextDueDate?: string;
  lastSubmitted?: string;
  template?: string;
}

export interface Performance {
  overallScore: number;
  dimensions: Array<{
    name: string;
    score: number;
    weight: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
  }>;
  lastAssessment?: string;
}

export interface TeamMember {
  user: string | any;
  role: 'MANAGER' | 'COORDINATOR' | 'M&E_SPECIALIST' | 'FINANCIAL_OFFICER' | 'TECHNICAL_ADVISOR';
  responsibilities: string[];
  projects: string[];
}

export interface PortfolioStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  totalProjects: number;
  totalBudget: number;
  avgPerformance: number;
}

const portfolioService = {
  // Obtenir tous les portfolios
  getAll: async (params?: {
    status?: string;
    portfolioType?: string;
  }): Promise<Portfolio[]> => {
    const response = await axios.get(API_URL, { params });
    return response.data.data || response.data || [];
  },

  // Obtenir un portfolio par ID
  getById: async (id: string): Promise<Portfolio> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
  },

  // Créer un portfolio
  create: async (data: Partial<Portfolio>): Promise<Portfolio> => {
    const response = await axios.post(API_URL, data);
    return response.data.data;
  },

  // Mettre à jour un portfolio
  update: async (id: string, data: Partial<Portfolio>): Promise<Portfolio> => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data.data;
  },

  // Supprimer un portfolio
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  // Ajouter un projet au portfolio
  addProject: async (portfolioId: string, projectId: string): Promise<Portfolio> => {
    const response = await axios.post(`${API_URL}/${portfolioId}/projects`, { projectId });
    return response.data.data;
  },

  // Retirer un projet du portfolio
  removeProject: async (portfolioId: string, projectId: string): Promise<Portfolio> => {
    const response = await axios.delete(`${API_URL}/${portfolioId}/projects/${projectId}`);
    return response.data.data;
  },

  // Obtenir les statistiques globales
  getGlobalStats: async (): Promise<any> => {
    const response = await axios.get(`${API_URL}/stats/global`);
    return response.data;
  },

  // Obtenir les statistiques d'un portfolio
  getStats: async (portfolioId: string): Promise<any> => {
    const response = await axios.get(`${API_URL}/${portfolioId}/stats`);
    return response.data.data;
  },

  // Calculer les indicateurs agrégés
  calculateAggregatedIndicators: async (portfolioId: string): Promise<any> => {
    const response = await axios.post(`${API_URL}/${portfolioId}/calculate-indicators`);
    return response.data.data;
  },

  // Calculer le score de performance
  calculatePerformanceScore: async (portfolioId: string): Promise<number> => {
    const response = await axios.post(`${API_URL}/${portfolioId}/calculate-performance`);
    return response.data.data.score;
  },

  // Générer un rapport de synthèse
  generateSummaryReport: async (portfolioId: string): Promise<any> => {
    const response = await axios.get(`${API_URL}/${portfolioId}/summary-report`);
    return response.data.data;
  },

  // Ajouter un risque
  addRisk: async (portfolioId: string, risk: Partial<Risk>): Promise<Portfolio> => {
    const response = await axios.post(`${API_URL}/${portfolioId}/risks`, risk);
    return response.data.data;
  },

  // Ajouter une leçon apprise
  addLessonLearned: async (portfolioId: string, lesson: Partial<LessonLearned>): Promise<Portfolio> => {
    const response = await axios.post(`${API_URL}/${portfolioId}/lessons`, lesson);
    return response.data.data;
  },

  // Obtenir une comparaison des projets
  getProjectsComparison: async (portfolioId: string): Promise<any> => {
    const response = await axios.get(`${API_URL}/${portfolioId}/projects-comparison`);
    return response.data.data;
  }
};

export default portfolioService;

