/**
 * Service pour les assistants IA avancés
 * Gestion des assistants admin et entreprise avec fallback
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface AdvancedAssistantResponse {
  success: boolean;
  question: string;
  answer: string;
  approach: string;
  confidence: number;
  responseTime: number;
  metadata?: {
    adminCapabilities?: string[];
    enterpriseCapabilities?: string[];
    processingTime?: number;
    adminLevel?: string;
    enterpriseLevel?: string;
    systemImpact?: string;
    userProfile?: any;
    enterpriseContext?: any;
    personalizationLevel?: string;
    customizationApplied?: boolean;
    [key: string]: any;
  };
  suggestions?: string[];
  error?: string;
  timestamp?: Date;
}

export interface ServiceHealth {
  admin: boolean;
  enterprise: boolean;
  optimized: boolean;
  timestamp: Date;
}

export interface UserProfile {
  user: {
    id: string;
    name?: string;
    email?: string;
    joinDate?: Date;
  };
  enterprise: {
    id: string;
    name?: string;
    secteur?: string;
    taille?: string;
    maturity?: string;
  };
  preferences: any;
  usagePatterns: any;
  experience: 'beginner' | 'intermediate' | 'expert';
  goals: Array<{
    name: string;
    progress: number;
    target: any;
  }>;
  strengths: string[];
  areasForImprovement: string[];
}

class AdvancedAssistantService {
  private api: AxiosInstance;
  private fallbackService: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.fallbackService = axios.create({
      baseURL: process.env.REACT_APP_API_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Configuration des intercepteurs
   */
  private setupInterceptors(): void {
    // Intercepteur de requête
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur de réponse
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Erreur API avancée:', error);
        return Promise.reject(error);
      }
    );

    // Même configuration pour le service de fallback
    this.fallbackService.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Pose de question avec sélection automatique de l'assistant
   */
  async askQuestion(
    question: string,
    userRole: 'admin' | 'enterprise',
    enterpriseId?: string,
    sessionId?: string,
    context?: string[]
  ): Promise<AdvancedAssistantResponse> {
    try {
      // Vérification de la santé des services
      const health = await this.getServiceHealth();
      
      let endpoint: string;
      let payload: any = {
        question,
        sessionId,
        context
      };

      // Sélection de l'endpoint selon le rôle et la disponibilité
      if (userRole === 'admin' && health.admin) {
        endpoint = '/api/advanced-assistant/admin/ask';
        console.log('🤖 Utilisation de l\'assistant admin avancé');
      } else if (userRole === 'enterprise' && health.enterprise) {
        endpoint = '/api/advanced-assistant/enterprise/ask';
        console.log('🏢 Utilisation de l\'assistant entreprise personnalisé');
      } else {
        // Fallback vers l'assistant optimisé
        endpoint = '/api/assistant/ask';
        payload.enterpriseId = enterpriseId;
        console.log('🔄 Utilisation de l\'assistant optimisé (fallback)');
      }

      const response: AxiosResponse<AdvancedAssistantResponse> = await this.api.post(endpoint, payload);
      
      return {
        ...response.data,
        metadata: {
          ...response.data.metadata,
          assistantType: userRole === 'admin' ? 'admin' : 'enterprise',
          fallbackUsed: endpoint === '/api/assistant/ask',
          serviceHealth: health
        }
      };

    } catch (error: any) {
      console.error('Erreur question avancée:', error);
      
      // Fallback vers l'assistant optimisé en cas d'erreur
      try {
        console.log('🔄 Tentative de fallback vers l\'assistant optimisé');
        
        const fallbackResponse: AxiosResponse<AdvancedAssistantResponse> = await this.fallbackService.post(
          '/api/assistant/ask',
          {
            question,
            enterpriseId
          }
        );

        return {
          ...fallbackResponse.data,
          metadata: {
            ...fallbackResponse.data.metadata,
            assistantType: 'optimized',
            fallbackUsed: true,
            error: error.message
          }
        };

      } catch (fallbackError: any) {
        console.error('Erreur fallback:', fallbackError);
        throw new Error(fallbackError.response?.data?.error || 'Erreur lors de la communication avec l\'assistant');
      }
    }
  }

  /**
   * Récupération de la santé des services
   */
  async getServiceHealth(): Promise<ServiceHealth> {
    try {
      const response = await this.api.get('/api/advanced-assistant/health');
      return response.data.health;
    } catch (error) {
      console.error('Erreur vérification santé:', error);
      return {
        admin: false,
        enterprise: false,
        optimized: true,
        timestamp: new Date()
      };
    }
  }

  /**
   * Récupération du profil utilisateur (entreprise uniquement)
   */
  async getUserProfile(userId: string, enterpriseId: string): Promise<UserProfile | null> {
    try {
      const response = await this.api.get('/api/advanced-assistant/enterprise/profile');
      return response.data.profile;
    } catch (error) {
      console.error('Erreur récupération profil:', error);
      return null;
    }
  }

  /**
   * Récupération des suggestions personnalisées
   */
  async getPersonalizedSuggestions(
    userRole: 'admin' | 'enterprise',
    enterpriseId?: string
  ): Promise<string[]> {
    try {
      let endpoint: string;
      
      if (userRole === 'admin') {
        endpoint = '/api/advanced-assistant/admin/capabilities';
      } else {
        endpoint = '/api/advanced-assistant/enterprise/suggestions';
      }

      const response = await this.api.get(endpoint);
      
      if (userRole === 'admin') {
        // Conversion des capacités en suggestions
        const capabilities = response.data.capabilities;
        return Object.keys(capabilities).map(cap => 
          `Utiliser la fonctionnalité ${cap.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        );
      } else {
        return response.data.suggestions || [];
      }

    } catch (error) {
      console.error('Erreur suggestions personnalisées:', error);
      
      // Suggestions par défaut
      return userRole === 'admin' 
        ? [
            'Affiche-moi les statistiques globales',
            'Comment gérer les utilisateurs ?',
            'Configuration du système',
            'Rapports de performance'
          ]
        : [
            'Affiche-moi mes KPIs',
            'Comment créer un rapport ?',
            'Améliorer mes performances',
            'Historique des activités'
          ];
    }
  }

  /**
   * Récupération des statistiques de l'assistant
   */
  async getAssistantStats(userRole: 'admin' | 'enterprise'): Promise<any> {
    try {
      let endpoint: string;
      
      if (userRole === 'admin') {
        endpoint = '/api/advanced-assistant/admin/stats';
      } else {
        endpoint = '/api/advanced-assistant/enterprise/stats';
      }

      const response = await this.api.get(endpoint);
      return response.data.stats;

    } catch (error) {
      console.error('Erreur statistiques assistant:', error);
      return null;
    }
  }

  /**
   * Envoi de feedback utilisateur
   */
  async sendFeedback(
    messageId: string,
    feedback: 'positive' | 'negative',
    comment?: string
  ): Promise<void> {
    try {
      await this.api.post('/api/advanced-assistant/feedback', {
        messageId,
        feedback,
        comment
      });
    } catch (error) {
      console.error('Erreur envoi feedback:', error);
    }
  }

  /**
   * Export de conversation
   */
  async exportConversation(sessionId: string): Promise<Blob> {
    try {
      const response = await this.api.get(`/api/advanced-assistant/export/${sessionId}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de l\'export de la conversation');
    }
  }

  /**
   * Récupération de l'historique conversationnel
   */
  async getConversationHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await this.api.get(`/api/advanced-assistant/memory/history/${userId}`, {
        params: { limit }
      });
      
      return response.data.history || [];
    } catch (error) {
      console.error('Erreur historique conversation:', error);
      return [];
    }
  }

  /**
   * Récupération du contexte de session
   */
  async getSessionContext(sessionId: string): Promise<any> {
    try {
      const response = await this.api.get(`/api/advanced-assistant/memory/context/${sessionId}`);
      return response.data.context;
    } catch (error) {
      console.error('Erreur contexte session:', error);
      return null;
    }
  }

  /**
   * Rechargement de la base de connaissances
   */
  async reloadKnowledgeBase(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post('/api/assistant/admin/reload-knowledge');
      return response.data;
    } catch (error: any) {
      throw new Error(`Erreur lors du rechargement: ${error.message}`);
    }
  }

  /**
   * Récupération des statistiques globales
   */
  async getGlobalStats(): Promise<any> {
    try {
      const response = await this.api.get('/api/advanced-assistant/global/stats');
      return response.data.stats;
    } catch (error) {
      console.error('Erreur statistiques globales:', error);
      return null;
    }
  }
}

// Instance singleton
const advancedAssistantService = new AdvancedAssistantService();

export default advancedAssistantService;
