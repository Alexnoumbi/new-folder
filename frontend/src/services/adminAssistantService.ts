import axios from 'axios';

interface AssistantResponse {
  success: boolean;
  question?: string;
  answer: string;
  approach?: string;
  confidence?: number;
  responseTime?: number;
  metadata?: {
    category?: string;
    source?: string;
    score?: number;
    hasDetails?: boolean;
    adminCapabilities?: string[];
    processingTime?: number;
    adminLevel?: string;
  };
  timestamp?: string;
}

class AdminAssistantService {
  private baseURL: string;

  constructor() {
    this.baseURL = '/api/advanced-assistant';
    console.log('🚀 AdminAssistantService initialisé avec baseURL:', this.baseURL);
  }

  /**
   * Pose une question à l'assistant administrateur
   */
  async askQuestion(question: string, sessionId?: string): Promise<AssistantResponse> {
    try {
      console.log(`🧠 Question admin: "${question}"`);

      const payload: { question: string; sessionId?: string } = { question };
      if (sessionId) {
        payload.sessionId = sessionId;
      }

      const response = await axios.post(
        `${this.baseURL}/admin/ask`,
        payload,
        {
          timeout: 30000, // 30 secondes
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log(`📨 Réponse reçue:`, {
        success: response.data.success,
        hasAnswer: !!response.data.answer,
        approach: response.data.approach,
        confidence: response.data.confidence,
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur assistant admin:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Retourner une réponse de fallback
      const errorMessage = error.response?.data?.error || 'Désolé, je ne peux pas répondre à cette question pour le moment.';

      return {
        success: false,
        answer: errorMessage,
        approach: 'error',
        confidence: 0,
      };
    }
  }

  /**
   * Obtient les capacités de l'assistant
   */
  async getCapabilities(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/admin/capabilities`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération capacités:', error);
      return null;
    }
  }

  /**
   * Obtient les statistiques
   */
  async getStats(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/admin/stats`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération stats:', error);
      return null;
    }
  }
}

export default new AdminAssistantService();

