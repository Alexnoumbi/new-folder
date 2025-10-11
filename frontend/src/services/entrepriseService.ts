import api from './api';

export interface Entreprise {
  _id: string;
  identification?: {
    nomEntreprise?: string;
    raisonSociale?: string;
    region?: string;
    ville?: string;
    dateCreation?: Date;
    secteurActivite?: string;
    sousSecteur?: string;
    filiereProduction?: string;
    formeJuridique?: string;
    numeroContribuable?: string;
  };
  performanceEconomique?: {
    chiffreAffaires?: {
      montant?: number;
      devise?: string;
      periode?: string;
    };
    evolutionCA?: string;
    coutsProduction?: {
      montant?: number;
      devise?: string;
    };
    evolutionCouts?: string;
    situationTresorerie?: string;
    sourcesFinancement?: any;
  };
  investissementEmploi?: {
    effectifsEmployes?: number;
    nouveauxEmploisCrees?: number;
    nouveauxInvestissementsRealises?: boolean;
    typesInvestissements?: any;
  };
  innovationDigitalisation?: {
    integrationInnovation?: number;
    integrationEconomieNumerique?: number;
    utilisationIA?: number;
  };
  conventions?: any;
  contact?: {
    telephone?: string;
    email?: string;
    siteWeb?: string;
    adresse?: any;
  };
  statut?: string;
  conformite?: string;
  commentaireConformite?: string;
  derniereVerificationConformite?: Date;
  informationsCompletes?: boolean;
  dateCreation?: Date;
  dateModification?: Date;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Champs de compatibilité (anciens noms)
  nom?: string;
  name?: string;
  region?: string;
  secteurActivite?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  employees?: number;
  sector?: string;
  location?: string;
  kpiScore?: number;
  status?: string;
  
  // Champs statistiques
  kpiValides?: number;
  totalKpis?: number;
  documentsSoumis?: number;
  documentsRequis?: number;
  visitesTerminees?: number;
  visitesPlanifiees?: number;
}

export interface EntrepriseStats {
  total: number;
  actives: number;
  enAttente: number;
  suspendues: number;
  inactives: number;
  completes: number;
  totalEmployes: number;
  parRegion: Array<{ _id: string; count: number }>;
  parSecteur: Array<{ _id: string; count: number }>;
  // Champs supplémentaires pour Enterprise Dashboard
  scoreGlobal?: number;
  kpiValides?: number;
  totalKpis?: number;
  documentsRequis?: number;
  documentsSoumis?: number;
  visitesPlanifiees?: number;
  visitesTerminees?: number;
  statutConformite?: 'green' | 'yellow' | 'red';
  evolutionKpis?: Array<{ date: string; score: number }>;
  entrepriseId?: string;
}

export interface EntrepriseEvolution {
  month: string;
  count: number;
}

// Obtenir toutes les entreprises
export const getEntreprises = async (): Promise<Entreprise[]> => {
  try {
    const response = await api.get('/entreprises');
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Error fetching entreprises:', error);
    throw error;
  }
};

// Obtenir une entreprise par ID
export const getEntreprise = async (id: string): Promise<Entreprise> => {
  try {
    const response = await api.get(`/entreprises/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching entreprise:', error);
    throw error;
  }
};

// Obtenir toutes les informations détaillées d'une entreprise (documents, reports, KPIs, messages, visits)
export const getEntrepriseComplete = async (id: string): Promise<any> => {
  try {
    const response = await api.get(`/entreprises/${id}/complete`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching complete enterprise data:', error);
    throw error;
  }
};

// Obtenir les entreprises agréées uniquement
export const getEntreprisesAgrees = async (): Promise<Entreprise[]> => {
  try {
    const response = await api.get('/entreprises/admin/agrees');
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Error fetching entreprises agréées:', error);
    throw error;
  }
};

// Obtenir les statistiques globales des entreprises
export const getGlobalStats = async (): Promise<EntrepriseStats> => {
  try {
    const response = await api.get('/entreprises/admin/stats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching global stats:', error);
    throw error;
  }
};

// Obtenir l'évolution des entreprises
export const getEntreprisesEvolution = async (start?: string): Promise<EntrepriseEvolution[]> => {
  try {
    const response = await api.get('/entreprises/admin/evolution', {
      params: start ? { start } : undefined
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching entreprises evolution:', error);
    throw error;
  }
};

// Créer une nouvelle entreprise
export const createEntreprise = async (data: Partial<Entreprise>): Promise<Entreprise> => {
  try {
    const response = await api.post('/entreprises', data);
    return response.data.data || response.data.entreprise;
  } catch (error) {
    console.error('Error creating entreprise:', error);
    throw error;
  }
};

// Mettre à jour une entreprise
export const updateEntreprise = async (id: string, data: Partial<Entreprise>): Promise<Entreprise> => {
  try {
    const response = await api.put(`/entreprises/${id}`, data);
    return response.data.data || response.data.entreprise;
  } catch (error) {
    console.error('Error updating entreprise:', error);
    throw error;
  }
};

// Mettre à jour le statut d'une entreprise
export const updateEntrepriseStatut = async (id: string, statut: string): Promise<Entreprise> => {
  try {
    const response = await api.patch(`/entreprises/${id}/statut`, { statut });
    return response.data.data || response.data.entreprise;
  } catch (error) {
    console.error('Error updating entreprise statut:', error);
    throw error;
  }
};

// Mettre à jour la conformité d'une entreprise
export const updateEntrepriseConformite = async (
  id: string, 
  conformite: string, 
  commentaireConformite?: string
): Promise<Entreprise> => {
  try {
    const response = await api.patch(`/entreprises/${id}/conformite`, { 
      conformite, 
      commentaireConformite 
    });
    return response.data.data || response.data.entreprise;
  } catch (error) {
    console.error('Error updating entreprise conformite:', error);
    throw error;
  }
};

// Obtenir l'évolution temporelle d'une entreprise
export const getEntrepriseEvolutionData = async (id: string): Promise<any> => {
  try {
    const response = await api.get(`/entreprises/${id}/evolution`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching evolution data:', error);
    throw error;
  }
};

// Obtenir les snapshots historiques d'une entreprise
export const getEntrepriseSnapshots = async (id: string): Promise<any[]> => {
  try {
    const response = await api.get(`/entreprises/${id}/snapshots`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    throw error;
  }
};

// Obtenir le journal d'activité d'une entreprise
export const getEntrepriseActivityLog = async (id: string, limit: number = 50): Promise<any[]> => {
  try {
    const response = await api.get(`/entreprises/${id}/activity-log`, {
      params: { limit }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching activity log:', error);
    throw error;
  }
};

// Supprimer une entreprise
export const deleteEntreprise = async (id: string): Promise<void> => {
  try {
    await api.delete(`/entreprises/${id}`);
  } catch (error) {
    console.error('Error deleting entreprise:', error);
    throw error;
  }
};

// Obtenir les documents d'une entreprise
export const getEntrepriseDocuments = async (id: string): Promise<any[]> => {
  try {
    const response = await api.get(`/entreprises/${id}/documents`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Error fetching entreprise documents:', error);
    throw error;
  }
};

// Obtenir les contrôles d'une entreprise
export const getEntrepriseControls = async (id: string): Promise<any[]> => {
  try {
    const response = await api.get(`/entreprises/${id}/controls`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Error fetching entreprise controls:', error);
    throw error;
  }
};

// Obtenir les affiliations d'une entreprise
export const getEntrepriseAffiliations = async (id: string): Promise<any[]> => {
  try {
    const response = await api.get(`/entreprises/${id}/affiliations`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Error fetching entreprise affiliations:', error);
    throw error;
  }
};

// Obtenir l'historique KPI d'une entreprise
export const getEntrepriseKPIHistory = async (id: string): Promise<any[]> => {
  try {
    const response = await api.get(`/entreprises/${id}/kpi-history`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Error fetching entreprise KPI history:', error);
    throw error;
  }
};

// Obtenir les messages d'une entreprise
export const getEntrepriseMessages = async (id: string): Promise<any[]> => {
  try {
    const response = await api.get(`/entreprises/${id}/messages`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Error fetching entreprise messages:', error);
    throw error;
  }
};

// Obtenir les rapports d'une entreprise
export const getEntrepriseReports = async (id: string): Promise<any[]> => {
  try {
    const response = await api.get(`/entreprises/${id}/reports`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Error fetching entreprise reports:', error);
    throw error;
  }
};

// Interfaces supplémentaires pour compatibilité
export interface Control {
  _id: string;
  id?: string;
  type: string;
  date: string;
  status: string;
  inspector: string;
  findings: string[];
  name?: string;
  category?: string;
  priority?: string;
  progress?: number;
  dueDate?: string;
  responsible?: string;
  description?: string;
}

export interface Affiliation {
  id: string;
  partnerName: string;
  type: string;
  status: string;
  score: number;
  startDate: Date;
  endDate?: Date;
  description?: string;
}

// Fonction pour récupérer les statistiques de l'entreprise (pour Enterprise Dashboard)
export const getEntrepriseStats = async (email?: string): Promise<any> => {
  try {
    const response = await api.get('/entreprises/stats', {
      headers: email ? { 'x-user-email': email } : undefined
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching entreprise stats:', error);
    throw error;
  }
};

// Fonction pour récupérer les contrôles
export const getControls = async (entrepriseId: string): Promise<Control[]> => {
  return getEntrepriseControls(entrepriseId);
};

export default {
  getEntreprises,
  getEntreprise,
  getEntreprisesAgrees,
  getGlobalStats,
  getEntreprisesEvolution,
  createEntreprise,
  updateEntreprise,
  updateEntrepriseStatut,
  deleteEntreprise,
  getEntrepriseDocuments,
  getEntrepriseControls,
  getEntrepriseAffiliations,
  getEntrepriseKPIHistory,
  getEntrepriseMessages,
  getEntrepriseReports,
  getEntrepriseStats,
  getEntrepriseComplete,
  getEntrepriseEvolutionData,
  getEntrepriseSnapshots,
  getEntrepriseActivityLog,
  updateEntrepriseConformite,
  getControls
};
