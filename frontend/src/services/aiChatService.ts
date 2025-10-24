import api from './api';
import {
  SendMessageRequest,
  SendMessageResponse,
  EscalateRequest,
  EscalateResponse,
  ConversationsResponse,
  ConversationDetailsResponse,
  AIStatsResponse,
  AIHealthResponse,
  AIConversation,
  AIConversationSummary,
  AIStats,
  AIError
} from '../types/aiChat.types';

class AIChatService {
  private baseUrl = '/ai-chat';

  /**
   * Envoyer un message à l'IA admin
   */
  async sendAdminMessage(message: string, conversationId?: string): Promise<SendMessageResponse> {
    try {
      const request: SendMessageRequest = {
        message: message.trim(),
        ...(conversationId && { conversationId })
      };

      const response = await api.post<SendMessageResponse>(
        `${this.baseUrl}/admin/message`,
        request
      );

      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Erreur lors de l\'envoi du message admin');
    }
  }

  /**
   * Envoyer un message à l'IA entreprise
   */
  async sendEnterpriseMessage(message: string, conversationId?: string): Promise<SendMessageResponse> {
    try {
      const request: SendMessageRequest = {
        message: message.trim(),
        ...(conversationId && { conversationId })
      };

      const response = await api.post<SendMessageResponse>(
        `${this.baseUrl}/enterprise/message`,
        request
      );

      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Erreur lors de l\'envoi du message entreprise');
    }
  }

  /**
   * Récupérer les conversations d'un utilisateur
   */
  async getConversations(
    page: number = 1,
    limit: number = 10,
    role?: 'admin' | 'entreprise'
  ): Promise<ConversationsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(role && { role })
      });

      const response = await api.get<ConversationsResponse>(
        `${this.baseUrl}/conversations?${params}`
      );

      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Erreur lors de la récupération des conversations');
    }
  }

  /**
   * Récupérer les détails d'une conversation
   */
  async getConversationDetails(conversationId: string): Promise<ConversationDetailsResponse> {
    try {
      const response = await api.get<ConversationDetailsResponse>(
        `${this.baseUrl}/conversations/${conversationId}`
      );

      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Erreur lors de la récupération des détails de conversation');
    }
  }

  /**
   * Escalader une conversation vers un administrateur
   */
  async escalateToAdmin(conversationId: string, details: string): Promise<EscalateResponse> {
    try {
      const request: EscalateRequest = {
        conversationId,
        details: details.trim()
      };

      const response = await api.post<EscalateResponse>(
        `${this.baseUrl}/enterprise/escalate`,
        request
      );

      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Erreur lors de l\'escalade vers l\'administrateur');
    }
  }

  /**
   * Supprimer une conversation
   */
  async deleteConversation(conversationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(
        `${this.baseUrl}/conversations/${conversationId}`
      );

      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Erreur lors de la suppression de la conversation');
    }
  }

  /**
   * Récupérer les statistiques IA (admin uniquement)
   */
  async getAIStats(): Promise<AIStatsResponse> {
    try {
      const response = await api.get<AIStatsResponse>(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Erreur lors de la récupération des statistiques IA');
    }
  }

  /**
   * Vérifier le statut de santé de l'IA
   */
  async getAIHealth(): Promise<AIHealthResponse> {
    try {
      const response = await api.get<AIHealthResponse>(`${this.baseUrl}/health`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Erreur lors de la vérification du statut IA');
    }
  }

  /**
   * Méthode utilitaire pour envoyer un message selon le type d'utilisateur
   */
  async sendMessage(
    message: string,
    userType: 'admin' | 'entreprise',
    conversationId?: string
  ): Promise<SendMessageResponse> {
    if (userType === 'admin') {
      return this.sendAdminMessage(message, conversationId);
    } else {
      return this.sendEnterpriseMessage(message, conversationId);
    }
  }

  /**
   * Récupérer toutes les conversations avec pagination automatique
   */
  async getAllConversations(
    userType: 'admin' | 'entreprise' = 'entreprise'
  ): Promise<AIConversationSummary[]> {
    try {
      const allConversations: AIConversationSummary[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await this.getConversations(page, 50, userType);
        allConversations.push(...response.data.conversations);
        
        hasMore = page < response.data.pagination.pages;
        page++;
      }

      return allConversations;
    } catch (error: any) {
      throw this.handleError(error, 'Erreur lors de la récupération de toutes les conversations');
    }
  }

  /**
   * Rechercher dans les conversations
   */
  async searchConversations(
    query: string,
    userType: 'admin' | 'entreprise' = 'entreprise'
  ): Promise<AIConversationSummary[]> {
    try {
      const conversations = await this.getAllConversations(userType);
      
      const lowerQuery = query.toLowerCase();
      return conversations.filter(conv => 
        conv.lastMessage.toLowerCase().includes(lowerQuery) ||
        (conv.metadata.context?.nomEntreprise || '').toLowerCase().includes(lowerQuery)
      );
    } catch (error: any) {
      throw this.handleError(error, 'Erreur lors de la recherche dans les conversations');
    }
  }

  /**
   * Valider un message avant envoi
   */
  validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message || typeof message !== 'string') {
      return { isValid: false, error: 'Le message ne peut pas être vide' };
    }

    const trimmedMessage = message.trim();
    
    if (trimmedMessage.length === 0) {
      return { isValid: false, error: 'Le message ne peut pas être vide' };
    }

    if (trimmedMessage.length > 2000) {
      return { isValid: false, error: 'Le message ne peut pas dépasser 2000 caractères' };
    }

    // Vérifier les patterns suspects
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\(/i,
      /expression\(/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(trimmedMessage))) {
      return { isValid: false, error: 'Le message contient du contenu non autorisé' };
    }

    return { isValid: true };
  }

  /**
   * Valider les détails d'escalade
   */
  validateEscalationDetails(details: string): { isValid: boolean; error?: string } {
    if (!details || typeof details !== 'string') {
      return { isValid: false, error: 'Les détails ne peuvent pas être vides' };
    }

    const trimmedDetails = details.trim();
    
    if (trimmedDetails.length < 10) {
      return { isValid: false, error: 'Les détails doivent contenir au moins 10 caractères' };
    }

    if (trimmedDetails.length > 1000) {
      return { isValid: false, error: 'Les détails ne peuvent pas dépasser 1000 caractères' };
    }

    return { isValid: true };
  }

  /**
   * Formater un message pour l'affichage
   */
  formatMessageForDisplay(message: string): string {
    // Remplacer les URLs par des liens cliquables
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let formattedMessage = message.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Formater les listes à puces
    formattedMessage = formattedMessage.replace(/^[\s]*[-*]\s+(.+)$/gm, '• $1');
    
    // Formater les numéros de liste
    formattedMessage = formattedMessage.replace(/^[\s]*\d+\.\s+(.+)$/gm, (match, content) => {
      return match; // Garder tel quel pour l'instant
    });
    
    return formattedMessage;
  }

  /**
   * Extraire les liens d'un message
   */
  extractLinks(message: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return message.match(urlRegex) || [];
  }

  /**
   * Gestionnaire d'erreurs centralisé
   */
  private handleError(error: any, defaultMessage: string): Error {
    console.error('AIChatService Error:', error);

    if (error.response?.data) {
      const errorData = error.response.data as AIError;
      
      if (errorData.message) {
        return new Error(errorData.message);
      }
      
      if (errorData.errors && errorData.errors.length > 0) {
        return new Error(errorData.errors.map(e => e.message).join(', '));
      }
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error(defaultMessage);
  }

  /**
   * Méthodes de cache local (localStorage)
   */
  private getCacheKey(key: string): string {
    return `ai_chat_${key}`;
  }

  setCachedConversations(conversations: AIConversationSummary[]): void {
    try {
      localStorage.setItem(
        this.getCacheKey('conversations'),
        JSON.stringify({
          data: conversations,
          timestamp: Date.now()
        })
      );
    } catch (error) {
      console.warn('Impossible de mettre en cache les conversations:', error);
    }
  }

  getCachedConversations(): AIConversationSummary[] | null {
    try {
      const cached = localStorage.getItem(this.getCacheKey('conversations'));
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      
      // Cache valide pendant 5 minutes
      if (Date.now() - timestamp > 5 * 60 * 1000) {
        localStorage.removeItem(this.getCacheKey('conversations'));
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Impossible de récupérer les conversations du cache:', error);
      return null;
    }
  }

  clearCache(): void {
    try {
      localStorage.removeItem(this.getCacheKey('conversations'));
    } catch (error) {
      console.warn('Impossible de vider le cache:', error);
    }
  }
}

// Export d'une instance singleton
export const aiChatService = new AIChatService();

// Export des méthodes individuelles pour compatibilité
export const {
  sendAdminMessage,
  sendEnterpriseMessage,
  getConversations,
  getConversationDetails,
  escalateToAdmin,
  deleteConversation,
  getAIStats,
  getAIHealth,
  sendMessage,
  getAllConversations,
  searchConversations,
  validateMessage,
  validateEscalationDetails,
  formatMessageForDisplay,
  extractLinks
} = aiChatService;
