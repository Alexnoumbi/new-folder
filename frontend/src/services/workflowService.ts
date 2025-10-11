import axios from 'axios';

const API_URL = 'http://localhost:5000/api/workflows';

export interface WorkflowStep {
  name: string;
  description?: string;
  order: number;
  assignedTo?: string | any;
  assignedRole?: 'admin' | 'manager' | 'validator' | 'reviewer' | 'approver';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'SKIPPED';
  requiredAction?: 'APPROVE' | 'REVIEW' | 'VALIDATE' | 'COMMENT' | 'UPLOAD' | 'FILL_FORM';
  dueDate?: string;
  completedAt?: string;
  completedBy?: any;
  comment?: string;
  attachments?: Array<{
    name: string;
    url: string;
    uploadedAt: string;
  }>;
}

export interface Workflow {
  _id: string;
  name: string;
  description?: string;
  type: 'DOCUMENT_APPROVAL' | 'ENTERPRISE_VALIDATION' | 'REPORT_REVIEW' | 'CONVENTION_APPROVAL' | 'VISIT_APPROVAL' | 'CUSTOM';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  steps: WorkflowStep[];
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
    action: string;
  }>;
  relatedEntity?: {
    type: string;
    id: string;
    name: string;
  };
  participants?: Array<{
    user: string | any;
    role: string;
    notificationPreferences?: {
      email: boolean;
      inApp: boolean;
    };
  }>;
  notifications?: Array<any>;
  history?: Array<{
    action: string;
    performedBy: any;
    date: string;
    details: string;
    metadata?: any;
  }>;
  metrics?: {
    startedAt?: string;
    completedAt?: string;
    totalDuration?: number;
    averageStepDuration?: number;
    currentStep?: number;
    progressPercentage?: number;
  };
  settings?: {
    autoAssign: boolean;
    requireSequential: boolean;
    allowParallelSteps: boolean;
    sendNotifications: boolean;
    escalationEnabled: boolean;
    escalationDelay?: number;
  };
  createdBy?: any;
  updatedBy?: any;
  isTemplate: boolean;
  tags?: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStats {
  total: number;
  active: number;
  completed: number;
  draft: number;
  paused: number;
  byType: Record<string, number>;
}

export interface PendingTask {
  workflowId: string;
  workflowName: string;
  stepIndex: number;
  stepName: string;
  stepStatus: string;
  dueDate?: string;
  priority: string;
  relatedEntity?: any;
}

const workflowService = {
  // Obtenir tous les workflows
  getAll: async (params?: {
    status?: string;
    type?: string;
    isTemplate?: boolean;
  }): Promise<Workflow[]> => {
    const response = await axios.get(API_URL, { params });
    return response.data.data || response.data || [];
  },

  // Obtenir un workflow par ID
  getById: async (id: string): Promise<Workflow> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
  },

  // Créer un workflow
  create: async (data: Partial<Workflow>): Promise<Workflow> => {
    const response = await axios.post(API_URL, data);
    return response.data.data;
  },

  // Mettre à jour un workflow
  update: async (id: string, data: Partial<Workflow>): Promise<Workflow> => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data.data;
  },

  // Supprimer un workflow
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  // Démarrer un workflow
  start: async (id: string): Promise<Workflow> => {
    const response = await axios.post(`${API_URL}/${id}/start`);
    return response.data.data;
  },

  // Compléter une étape
  completeStep: async (workflowId: string, stepIndex: number, data?: {
    comment?: string;
    attachments?: any[];
  }): Promise<Workflow> => {
    const response = await axios.post(`${API_URL}/${workflowId}/steps/${stepIndex}/complete`, data);
    return response.data.data;
  },

  // Rejeter une étape
  rejectStep: async (workflowId: string, stepIndex: number, reason: string): Promise<Workflow> => {
    const response = await axios.post(`${API_URL}/${workflowId}/steps/${stepIndex}/reject`, { reason });
    return response.data.data;
  },

  // Obtenir les statistiques
  getStats: async (): Promise<WorkflowStats> => {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data.data;
  },

  // Obtenir mes tâches en attente
  getMyPendingTasks: async (): Promise<PendingTask[]> => {
    const response = await axios.get(`${API_URL}/my-tasks`);
    return response.data.data || [];
  }
};

export default workflowService;

