import api from './api';

export interface Enterprise {
  _id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  secteurActivite: string;
  region: string;
  ville: string;
  dateCreation: string;
  statut: 'actif' | 'inactif' | 'suspendu';
}

export interface EnterpriseOverview {
  totalKPIs: number;
  validatedKPIs: number;
  pendingKPIs: number;
  complianceScore: number;
  recentActivity: Array<{
    type: string;
    description: string;
    date: string;
  }>;
}

export interface KPITrend {
  date: string;
  value: number;
  target?: number;
}

export interface ComplianceStatus {
  overall: number;
  categories: Array<{
    name: string;
    score: number;
    status: 'good' | 'warning' | 'critical';
  }>;
}

export interface EntrepriseStats {
  scoreGlobal: number;
  kpiValides: number;
  totalKpis: number;
  documentsRequis: number;
  documentsSoumis: number;
  visitesPlanifiees: number;
  visitesTerminees: number;
  statutConformite: 'green' | 'yellow' | 'red';
  activiteRecente: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  evolutionKpis: Array<{
    date: string;
    score: number;
  }>;
}

export interface Control {
  id: string;
  name: string;
  category: string;
  status: 'compliant' | 'non-compliant' | 'in-progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  progress?: number;
  dueDate?: string;
  responsible?: string;
  description?: string;
}

export interface Affiliation {
  id: string;
  partnerName: string;
  type: string;
  status: 'active' | 'pending' | 'inactive';
  score?: number;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Entreprise {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  sector?: string;
  description?: string;
  employees?: number;
  createdAt?: string;
  location?: string;
  status?: 'active' | 'inactive' | 'pending';
  kpiScore?: number;
  scoreGlobal?: number;
  documentsSoumis?: number;
  documentsRequis?: number;
  visitesTerminees?: number;
  kpiValides?: number;
  totalKpis?: number;
}

export const getEntrepriseStats = async (): Promise<EntrepriseStats> => {
  const response = await api.get('/entreprise/stats');
  return response.data.data;
};

export const getEntrepriseInfo = async () => {
  const response = await api.get('/entreprise/me');
  return response.data;
};

// Legacy stubs to keep imports working
export const getControls = async (): Promise<Control[]> => { throw new Error('getControls n\'est pas disponible.'); };
export const createControl = async (): Promise<Control> => { throw new Error('createControl n\'est pas disponible.'); };
export const updateControl = async (): Promise<Control> => { throw new Error('updateControl n\'est pas disponible.'); };
export const deleteControl = async (): Promise<void> => { throw new Error('deleteControl n\'est pas disponible.'); };
export const getEntrepriseDetails = async (): Promise<Entreprise> => { throw new Error('getEntrepriseDetails n\'est pas disponible.'); };
export const getAffiliations = async (): Promise<Affiliation[]> => { throw new Error('getAffiliations n\'est pas disponible.'); };
export const getEntreprises = async (): Promise<Entreprise[]> => { throw new Error('getEntreprises n\'est pas disponible.'); };
export const updateEntreprise = async (_id?: string, _data?: Partial<Entreprise>): Promise<Entreprise> => { throw new Error('updateEntreprise n\'est pas disponible.'); };

const entrepriseService = {
  getEntrepriseStats,
  getEntrepriseInfo,
};

export default entrepriseService;
