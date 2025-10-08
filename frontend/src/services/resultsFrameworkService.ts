import api from './api';

export interface ResultsFramework {
  _id: string;
  project: string;
  name: string;
  description?: string;
  frameworkType: 'LOGFRAME' | 'THEORY_OF_CHANGE' | 'RESULTS_CHAIN' | 'OUTCOME_MAPPING';
  impact?: {
    description: string;
    indicators: string[];
    verificationMeans: string[];
    assumptions: string[];
  };
  outcomes: Outcome[];
  outputs: Output[];
  activities: Activity[];
  theoryOfChange?: TheoryOfChange;
  risks: Risk[];
  stakeholders: Stakeholder[];
  totalBudget?: Budget;
  projectPeriod: {
    startDate: Date;
    endDate: Date;
    phases: Phase[];
  };
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  overallProgress?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Outcome {
  _id?: string;
  level: number;
  description: string;
  indicators: string[];
  verificationMeans: string[];
  assumptions: string[];
  targetDate?: Date;
  responsibleParty?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'PARTIALLY_ACHIEVED' | 'NOT_ACHIEVED';
}

export interface Output {
  _id?: string;
  description: string;
  indicators: string[];
  verificationMeans: string[];
  assumptions: string[];
  targetDate?: Date;
  responsibleParty?: string;
  linkedOutcome?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'PARTIALLY_ACHIEVED' | 'NOT_ACHIEVED';
}

export interface Activity {
  _id?: string;
  description: string;
  linkedOutput?: string;
  inputs: string[];
  budget?: {
    amount: number;
    currency: 'FCFA' | 'USD' | 'EUR';
  };
  timeline?: {
    startDate: Date;
    endDate: Date;
  };
  responsibleParty?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';
  progressPercentage: number;
}

export interface TheoryOfChange {
  ultimateGoal: string;
  longTermOutcomes: OutcomeLevel[];
  intermediateOutcomes: OutcomeLevel[];
  shortTermOutcomes: OutcomeLevel[];
  activities: ToCActivity[];
  assumptions: string[];
  externalFactors: string[];
}

export interface OutcomeLevel {
  description: string;
  timeframe: string;
  indicators: string[];
}

export interface ToCActivity {
  description: string;
  responsibleParty: string;
  timeline: string;
}

export interface Risk {
  _id?: string;
  description: string;
  probability: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mitigationStrategy: string;
  status: 'IDENTIFIED' | 'MONITORING' | 'MITIGATED' | 'MATERIALIZED';
}

export interface Stakeholder {
  _id?: string;
  name: string;
  type: 'BENEFICIARY' | 'PARTNER' | 'DONOR' | 'GOVERNMENT' | 'IMPLEMENTING_AGENCY' | 'OTHER';
  role: string;
  influence: 'HIGH' | 'MEDIUM' | 'LOW';
  interest: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Budget {
  amount: number;
  currency: 'FCFA' | 'USD' | 'EUR';
  breakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export interface Phase {
  name: string;
  startDate: Date;
  endDate: Date;
  milestones: string[];
}

export interface FrameworkStats {
  totalOutcomes: number;
  achievedOutcomes: number;
  totalOutputs: number;
  achievedOutputs: number;
  totalActivities: number;
  completedActivities: number;
  overallProgress: number;
  overallStatus: string;
  totalIndicators: number;
  budgetUtilization: number;
}

const resultsFrameworkService = {
  // Créer un cadre de résultats
  createFramework: async (data: Partial<ResultsFramework>): Promise<ResultsFramework> => {
    const response = await api.post('/results-framework', data);
    return response.data.data;
  },

  // Obtenir les cadres par projet
  getFrameworksByProject: async (projectId: string): Promise<ResultsFramework[]> => {
    const response = await api.get(`/results-framework/project/${projectId}`);
    return response.data.data;
  },

  // Obtenir un cadre spécifique
  getFrameworkById: async (id: string): Promise<ResultsFramework> => {
    const response = await api.get(`/results-framework/${id}`);
    return response.data.data;
  },

  // Mettre à jour un cadre
  updateFramework: async (id: string, data: Partial<ResultsFramework>): Promise<ResultsFramework> => {
    const response = await api.put(`/results-framework/${id}`, data);
    return response.data.data;
  },

  // Supprimer un cadre
  deleteFramework: async (id: string): Promise<void> => {
    await api.delete(`/results-framework/${id}`);
  },

  // Ajouter un outcome
  addOutcome: async (frameworkId: string, outcome: Outcome): Promise<ResultsFramework> => {
    const response = await api.post(`/results-framework/${frameworkId}/outcomes`, outcome);
    return response.data.data;
  },

  // Ajouter un output
  addOutput: async (frameworkId: string, output: Output): Promise<ResultsFramework> => {
    const response = await api.post(`/results-framework/${frameworkId}/outputs`, output);
    return response.data.data;
  },

  // Ajouter une activité
  addActivity: async (frameworkId: string, activity: Activity): Promise<ResultsFramework> => {
    const response = await api.post(`/results-framework/${frameworkId}/activities`, activity);
    return response.data.data;
  },

  // Mettre à jour le statut d'une activité
  updateActivityStatus: async (
    frameworkId: string,
    activityId: string,
    status: Activity['status'],
    progressPercentage?: number
  ): Promise<ResultsFramework> => {
    const response = await api.put(
      `/results-framework/${frameworkId}/activities/${activityId}/status`,
      { status, progressPercentage }
    );
    return response.data.data;
  },

  // Lier un indicateur
  linkIndicator: async (
    frameworkId: string,
    elementType: 'impact' | 'outcome' | 'output',
    elementId: string,
    indicatorId: string
  ): Promise<ResultsFramework> => {
    const response = await api.post('/results-framework/link-indicator', {
      frameworkId,
      elementType,
      elementId,
      indicatorId
    });
    return response.data.data;
  },

  // Générer un rapport de cadre logique
  generateLogframeReport: async (id: string): Promise<any> => {
    const response = await api.get(`/results-framework/${id}/report`);
    return response.data.data;
  },

  // Mettre à jour la théorie du changement
  updateTheoryOfChange: async (id: string, theoryOfChange: TheoryOfChange): Promise<ResultsFramework> => {
    const response = await api.put(`/results-framework/${id}/theory-of-change`, theoryOfChange);
    return response.data.data;
  },

  // Ajouter un risque
  addRisk: async (frameworkId: string, risk: Risk): Promise<ResultsFramework> => {
    const response = await api.post(`/results-framework/${frameworkId}/risks`, risk);
    return response.data.data;
  },

  // Obtenir les statistiques
  getFrameworkStats: async (id: string): Promise<FrameworkStats> => {
    const response = await api.get(`/results-framework/${id}/stats`);
    return response.data.data;
  }
};

export default resultsFrameworkService;

