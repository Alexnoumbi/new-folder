import api from './api';

export interface Entreprise {
  _id: string;
  id?: string;  // Added for compatibility
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  secteurActivite: string;
  region: string;
  ville: string;
  dateCreation: string;
  createdAt?: string;  // Added for frontend display
  statut: 'actif' | 'inactif' | 'suspendu';
  // Additional fields
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  sector?: string;
  employees?: number;
  location?: string;
  kpiScore?: number;
  status?: 'active' | 'inactive' | 'pending';
  scoreGlobal?: number;
  documentsSoumis?: number;
  documentsRequis?: number;
  visitesTerminees?: number;
  kpiValides?: number;
  totalKpis?: number;
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
  documentsSoumis: number;
  documentsRequis: number;
  visitesPlanifiees: number;
  visitesTerminees: number;
  scoreGlobal: number;
  statutConformite: 'red' | 'yellow' | 'green';
  kpiValides: number;
  totalKpis: number;
  evolutionKpis?: Array<{ date: string; value: number }>;
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

// Fonctions CRUD principales
export const getEntreprises = async (): Promise<Entreprise[]> => {
  console.log('Calling getEntreprises...');
  try {
    const response = await api.get('/entreprises');
    return response.data;
  } catch (error) {
    console.error('Error in getEntreprises:', error);
    throw error;
  }
};

export const getEntreprise = async (id: string): Promise<Entreprise> => {
  const response = await api.get(`/entreprises/${id}`);
  return response.data;
};

export const getEntrepriseDetails = getEntreprise;

export const createEntreprise = async (data: Partial<Entreprise>): Promise<Entreprise> => {
  const response = await api.post('/entreprises', data);
  return response.data;
};

export const updateEntreprise = async (id: string, data: Partial<Entreprise>): Promise<Entreprise> => {
  const response = await api.put(`/entreprises/${id}`, data);
  return response.data;
};

export const deleteEntreprise = async (id: string): Promise<void> => {
  await api.delete(`/entreprises/${id}`);
};

// Stats et informations
export const getEntrepriseStats = async (entrepriseId: string): Promise<EntrepriseStats> => {
  console.log('Calling getEntrepriseStats...');
  try {
    const response = await api.get(`/entreprises/${entrepriseId}/stats`);
    console.log('Enterprise stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getEntrepriseStats:', error);
    throw error;
  }
};

export const getEntrepriseInfo = async (): Promise<Entreprise> => {
  const response = await api.get('/entreprises/me');
  return response.data;
};

export const updateEntrepriseProfile = async (data: Partial<Entreprise>): Promise<Entreprise> => {
  const response = await api.put('/entreprises/profile', data);
  return response.data;
};

// Ressources liées
export const getEntrepriseDocuments = async (id: string) => {
  const response = await api.get(`/entreprises/${id}/documents`);
  return response.data;
};

// Alias pour la compatibilité avec le code existant
export const getControls = async (id: string): Promise<Control[]> => {
  return getEntrepriseControls(id);
};

export const getEntrepriseControls = async (id: string): Promise<Control[]> => {
  const response = await api.get(`/entreprises/${id}/controls`);
  return response.data;
};

// Alias pour la compatibilité avec le code existant
export const getAffiliations = async (id: string): Promise<Affiliation[]> => {
  return getEntrepriseAffiliations(id);
};

export const getEntrepriseAffiliations = async (id: string): Promise<Affiliation[]> => {
  const response = await api.get(`/entreprises/${id}/affiliations`);
  return response.data;
};

export interface KPIHistoryPoint {
  date: string;
  value: number;
}

export const getEntrepriseKPIHistory = async (id: string): Promise<KPIHistoryPoint[]> => {
  try {
    const response = await api.get(`/entreprises/${id}/kpi-history`);
    console.log('KPI History response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching KPI history:', error);
    throw error;
  }
};

export const getEntrepriseMessages = async (id: string) => {
  const response = await api.get(`/entreprises/${id}/messages`);
  return response.data;
};

export const getEntrepriseReports = async (id: string) => {
  const response = await api.get(`/entreprises/${id}/reports`);
  return response.data;
};

const entrepriseService = {
  getEntreprises,
  getEntreprise,
  getEntrepriseDetails,
  createEntreprise,
  updateEntreprise,
  deleteEntreprise,
  getEntrepriseStats,
  getEntrepriseInfo,
  updateEntrepriseProfile,
  getEntrepriseDocuments,
  getControls,
  getEntrepriseControls,
  getAffiliations,
  getEntrepriseAffiliations,
  getEntrepriseKPIHistory,
  getEntrepriseMessages,
  getEntrepriseReports,
};

export default entrepriseService;
