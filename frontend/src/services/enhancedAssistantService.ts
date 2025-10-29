import axios, { AxiosResponse } from 'axios';

interface KnowledgeBaseResponse {
  success: boolean;
  question: string;
  answer: string;
  approach: 'knowledge_base' | 'fallback' | 'error';
  confidence: number;
  responseTime: number;
  service: string;
  metadata?: {
    category?: string;
    source?: string;
    score?: number;
    hasDetails?: boolean;
    hasSteps?: boolean;
    quickActions?: Array<{
      action: string;
      url: string;
      description: string;
    }>;
  };
  timestamp: string;
}

interface KnowledgeBaseStats {
  isInitialized: boolean;
  knowledgeBase: {
    totalEntries: number;
    categories: number;
    cacheSize: number;
    lastUpdated: string;
    entriesByCategory: Record<string, number>;
  };
  service: string;
  version: string;
}

interface SearchResult {
  success: boolean;
  query: string;
  category?: string;
  results: any;
  timestamp: string;
}

class EnhancedAssistantService {
  private baseURL: string;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private requestQueue: Map<string, Promise<any>>;

  constructor() {
    this.baseURL = '/api/enhanced-assistant';
    this.cache = new Map();
    this.requestQueue = new Map();
    
    console.log('🚀 EnhancedAssistantService initialisé avec baseURL:', this.baseURL);
    
    // Nettoyage du cache toutes les 5 minutes
    setInterval(() => this.cleanCache(), 5 * 60 * 1000);
  }

  /**
   * Pose une question à l'assistant amélioré
   */
  async askQuestion(question: string, enterpriseId?: string): Promise<KnowledgeBaseResponse> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`🧠 [${requestId}] === ENVOI QUESTION BASE DE CONNAISSANCES ===`);
      console.log(`🧠 [${requestId}] Question: "${question}"`);
      console.log(`🧠 [${requestId}] EnterpriseId: ${enterpriseId}`);
      
      const payload: { question: string; enterpriseId?: string } = { question };
      if (enterpriseId) {
        payload.enterpriseId = enterpriseId;
      }

      console.log(`📤 [${requestId}] Payload:`, payload);

      const requestKey = `ask_${question.slice(0, 50)}`;
      
      return await this.deduplicateRequest(requestKey, async () => {
        console.log(`📤 [${requestId}] Envoi question vers: ${this.baseURL}/ask`);
        
        const response: AxiosResponse<KnowledgeBaseResponse> = await axios.post(
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
          category: response.data.metadata?.category,
          source: response.data.metadata?.source,
          score: response.data.metadata?.score
        });

        return response.data;
      });

    } catch (error: any) {
      console.error(`❌ [${requestId}] Erreur assistant amélioré:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      
      const errorMessage = error.response?.data?.error || 'Erreur de communication avec l\'assistant amélioré';
      console.error(`📤 [${requestId}] Message d'erreur final: "${errorMessage}"`);
      
      const errorResponse: KnowledgeBaseResponse = {
        success: false,
        question: question,
        answer: errorMessage,
        approach: 'error',
        confidence: 0,
        responseTime: 0,
        service: 'enhanced',
        timestamp: new Date().toISOString()
      };

      return errorResponse;
    }
  }

  /**
   * Obtient les statistiques du service
   */
  async getStats(): Promise<KnowledgeBaseStats | null> {
    try {
      const response = await axios.get(`${this.baseURL}/stats`);
      return response.data.stats;
    } catch (error) {
      console.error('❌ Erreur récupération stats:', error);
      return null;
    }
  }

  /**
   * Recharge la base de connaissances (admin seulement)
   */
  async reloadKnowledge(): Promise<boolean> {
    try {
      console.log('🔄 Rechargement de la base de connaissances...');
      const response = await axios.post(`${this.baseURL}/reload`);
      console.log('✅ Base de connaissances rechargée:', response.data.message);
      return response.data.success;
    } catch (error: any) {
      console.error('❌ Erreur rechargement KB:', error);
      return false;
    }
  }

  /**
   * Recherche dans la base de connaissances
   */
  async searchKnowledge(query: string, category?: string): Promise<SearchResult | null> {
    try {
      const params = new URLSearchParams({ query });
      if (category) {
        params.append('category', category);
      }

      const response = await axios.get(`${this.baseURL}/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur recherche KB:', error);
      return null;
    }
  }

  /**
   * Health check du service
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur health check:', error);
      return null;
    }
  }

  /**
   * Évite les requêtes dupliquées
   */
  private async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.requestQueue.has(key)) {
      console.log(`⏳ Requête en cours pour: ${key}`);
      return await this.requestQueue.get(key);
    }

    const requestPromise = requestFn();
    this.requestQueue.set(key, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.requestQueue.delete(key);
    }
  }

  /**
   * Nettoie le cache expiré
   */
  private cleanCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    for (const [key, value] of entries) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
    
    console.log(`🧹 Cache nettoyé, ${this.cache.size} entrées restantes`);
  }

  /**
   * Obtient les suggestions basées sur la base de connaissances
   */
  async getSuggestions(): Promise<string[]> {
    try {
      const stats = await this.getStats();
      if (!stats?.knowledgeBase) {
        return this.getDefaultSuggestions();
      }

      const suggestions = [
        'Combien d\'utilisateurs sont connectés aujourd\'hui ?',
        'Quelles entreprises sont en attente de validation ?',
        'Comment créer un nouvel utilisateur ?',
        'Montre-moi les statistiques par secteur',
        'Comment générer un rapport mensuel ?',
        'Quel est l\'état de sécurité du système ?',
        'Comment configurer les paramètres système ?',
        'Montre-moi les métriques de performance'
      ];

      return suggestions;
    } catch (error) {
      console.error('❌ Erreur récupération suggestions:', error);
      return this.getDefaultSuggestions();
    }
  }

  /**
   * Suggestions par défaut
   */
  private getDefaultSuggestions(): string[] {
    return [
      'Combien d\'utilisateurs sont connectés ?',
      'Quelles entreprises sont en attente ?',
      'Comment créer un utilisateur ?',
      'Montre-moi les statistiques'
    ];
  }
}

export default new EnhancedAssistantService();