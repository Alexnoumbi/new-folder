/**
 * Service client optimisé pour l'assistant IA
 * Communication avec l'API /api/assistant
 */

import axios, { AxiosResponse } from 'axios';

// Types pour l'assistant optimisé
export interface AssistantQuestion {
  question: string;
  enterpriseId?: string;
}

export interface AssistantResponse {
  success: boolean;
  question?: string;
  answer?: string;
  approach?: 'instant' | 'rules' | 'embeddings' | 'fallback' | 'help' | 'error';
  confidence?: number;
  responseTime?: number;
  service?: string;
  metadata?: {
    pattern?: string;
    matchedQuestion?: string;
    category?: string;
    warning?: string;
    fromCache?: boolean;
    serviceMode?: string;
  };
  error?: string;
  timestamp?: string;
}

export interface AssistantSuggestion {
  suggestions: string[];
  userRole: string;
  count: number;
  timestamp: string;
}

export interface AssistantStatus {
  service: string;
  version: string;
  status: string;
  performance: {
    totalQuestions: number;
    successRate: number;
    averageResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
  approaches: {
    rules: { count: number; rate: number };
    embeddings: { count: number; rate: number };
    cache: { hits: number; rate: number };
  };
  services: {
    qa: {
      initialized: boolean;
      mode: string;
      lastResponse: string | null;
    };
    embeddings: any;
    vectorStore: any;
  };
  system: {
    uptime: number;
    memory: any;
    nodeVersion: string;
    timestamp: string;
  };
}

export interface AssistantHealth {
  status: 'healthy' | 'unhealthy' | 'error';
  service: string;
  initialized: boolean;
  serviceMode: string;
  uptime: number;
  timestamp: string;
}

class OptimizedAssistantService {
  private baseURL: string;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private requestQueue: Map<string, Promise<any>>;

  constructor() {
    this.baseURL = '/api/assistant';
    this.cache = new Map();
    this.requestQueue = new Map();
    
    console.log('🚀 OptimizedAssistantService initialisé avec baseURL:', this.baseURL);
    
    // Nettoyage du cache toutes les 5 minutes
    setInterval(() => this.cleanCache(), 5 * 60 * 1000);
  }

  /**
   * Nettoyage du cache expiré
   */
  private cleanCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, value] of entries) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Génération de clé de cache
   */
  private getCacheKey(endpoint: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}_${btoa(paramString)}`;
  }

  /**
   * Récupération depuis le cache
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    return null;
  }

  /**
   * Mise en cache
   */
  private setCache(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Gestion de la déduplication des requêtes
   */
  private async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key) as Promise<T>;
    }

    const promise = requestFn().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  /**
   * Poser une question à l'assistant
   */
  async askQuestion(question: string, enterpriseId?: string): Promise<AssistantResponse> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`🤔 [${requestId}] === ENVOI QUESTION FRONTEND ===`);
      console.log(`🤔 [${requestId}] Question: "${question}"`);
      console.log(`🤔 [${requestId}] EnterpriseId: ${enterpriseId}`);
      
      const payload: AssistantQuestion = { question };
      if (enterpriseId) {
        payload.enterpriseId = enterpriseId;
      }

      console.log(`📤 [${requestId}] Payload:`, payload);

      // Déduplication pour éviter les questions doubles
      const requestKey = `ask_${question.slice(0, 50)}`;
      
      return await this.deduplicateRequest(requestKey, async () => {
        console.log(`📤 [${requestId}] Envoi question vers: ${this.baseURL}/ask`);
        
        const response: AxiosResponse<AssistantResponse> = await axios.post(
          `${this.baseURL}/ask`,
          payload,
          {
            timeout: 30000, // 30 secondes
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        console.log(`📨 [${requestId}] Réponse reçue:`, {
          success: response.data.success,
          hasAnswer: !!response.data.answer,
          approach: response.data.approach,
          confidence: response.data.confidence,
          responseTime: response.data.responseTime,
          fromCache: response.data.metadata?.fromCache,
          service: response.data.service
        });

        return response.data;
      });

    } catch (error: any) {
      console.error(`❌ [${requestId}] Erreur assistant:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      
      const errorMessage = error.response?.data?.error || 'Erreur de communication avec l\'assistant';
      console.error(`📤 [${requestId}] Message d'erreur final: "${errorMessage}"`);
      
      const errorResponse: AssistantResponse = {
        success: false,
        error: errorMessage,
        approach: 'error',
        responseTime: 0,
        timestamp: new Date().toISOString()
      };

      return errorResponse;
    }
  }

  /**
   * Récupérer les suggestions contextuelles
   */
  async getSuggestions(): Promise<string[]> {
    try {
      const cacheKey = this.getCacheKey('suggestions');
      const cached = this.getFromCache<AssistantSuggestion>(cacheKey);
      
      if (cached) {
        return cached.suggestions;
      }

      const response: AxiosResponse<{ success: boolean; suggestions?: string[]; data?: AssistantSuggestion }> = 
        await axios.get(`${this.baseURL}/suggestions`);

      const suggestions = response.data.suggestions || response.data.data?.suggestions || [];
      
      // Cache pour 10 minutes
      this.setCache(cacheKey, response.data, 600000);
      
      return suggestions;

    } catch (error: any) {
      console.error('❌ Erreur suggestions:', error);
      
      // Suggestions par défaut en cas d'erreur
      return [
        "Comment puis-je vous aider ?",
        "Quelles sont mes données ?",
        "Comment améliorer mes performances ?",
        "Aide générale"
      ];
    }
  }

  /**
   * Vérifier le statut du service
   */
  async getServiceStatus(): Promise<AssistantStatus | null> {
    try {
      const cacheKey = this.getCacheKey('status');
      const cached = this.getFromCache<AssistantStatus>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response: AxiosResponse<{ success: boolean; status: AssistantStatus }> = 
        await axios.get(`${this.baseURL}/status`);

      if (response.data.success && response.data.status) {
        // Cache pour 30 secondes seulement (données en temps réel)
        this.setCache(cacheKey, response.data.status, 30000);
        return response.data.status;
      }

      return null;

    } catch (error: any) {
      console.error('❌ Erreur statut service:', error);
      return null;
    }
  }

  /**
   * Test de santé du service
   */
  async healthCheck(): Promise<AssistantHealth | null> {
    try {
      const response: AxiosResponse<{ success: boolean; health: AssistantHealth }> = 
        await axios.get(`${this.baseURL}/health`, { timeout: 5000 });

      return response.data.health;

    } catch (error: any) {
      console.error('❌ Erreur health check:', error);
      return {
        status: 'error',
        service: 'OptimizedAssistant',
        initialized: false,
        serviceMode: 'unknown',
        uptime: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Recharger la base de connaissances (admin uniquement)
   */
  async reloadKnowledge(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message?: string; error?: string }> = 
        await axios.post(`${this.baseURL}/admin/reload-knowledge`);

      // Invalider le cache après rechargement
      if (response.data.success) {
        this.cache.clear();
      }

      return response.data;

    } catch (error: any) {
      console.error('❌ Erreur rechargement:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du rechargement'
      };
    }
  }

  /**
   * Upload de fichier pour analyse
   */
  async uploadFile(file: File): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response: AxiosResponse<{ success: boolean; message?: string; error?: string }> = 
        await axios.post(`${this.baseURL}/upload/single`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 1 minute pour l'upload
        });

      return response.data;

    } catch (error: any) {
      console.error('❌ Erreur upload:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'upload'
      };
    }
  }

  /**
   * Récupérer les métriques de performance
   */
  async getMetrics(): Promise<any | null> {
    try {
      const response: AxiosResponse<{ success: boolean; metrics: any }> = 
        await axios.get(`${this.baseURL}/metrics`);

      return response.data.success ? response.data.metrics : null;

    } catch (error: any) {
      console.error('❌ Erreur métriques:', error);
      return null;
    }
  }

  /**
   * Nettoyage des ressources
   */
  cleanup(): void {
    this.cache.clear();
    this.requestQueue.clear();
  }

  /**
   * Statistiques du cache client
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instance singleton
export const optimizedAssistantService = new OptimizedAssistantService();
export default optimizedAssistantService;
