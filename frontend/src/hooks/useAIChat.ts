import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  AIConversationSummary, 
  AIConversation, 
  UseAIChatReturn,
  AIStats,
  AIHealthResponse
} from '../types/aiChat.types';
import { aiChatService } from '../services/aiChatService';

export const useAIChat = (userType: 'admin' | 'entreprise'): UseAIChatReturn => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<AIConversationSummary[]>([]);
  const [currentConversation, setCurrentConversation] = useState<AIConversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await aiChatService.getConversations(1, 50, userType);
      setConversations(response.data.conversations);
    } catch (error: any) {
      setError(error.message || 'Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  }, [user, userType]);

  const loadConversationDetails = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      const response = await aiChatService.getConversationDetails(conversationId);
      setCurrentConversation(response.data);
    } catch (error: any) {
      setError(error.message || 'Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (message: string, conversationId?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await aiChatService.sendMessage(message, userType, conversationId);
      
      // Reload conversations to update the list
      await loadConversations();
      
      // If we have a conversation ID, reload the details
      if (response.data.conversationId) {
        await loadConversationDetails(response.data.conversationId);
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  }, [user, userType, loadConversations, loadConversationDetails]);

  const escalateToAdmin = useCallback(async (conversationId: string, details: string) => {
    if (!user || userType !== 'entreprise') return;

    try {
      setLoading(true);
      setError(null);
      
      await aiChatService.escalateToAdmin(conversationId, details);
      
      // Reload conversations and current conversation
      await loadConversations();
      await loadConversationDetails(conversationId);
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'escalade');
    } finally {
      setLoading(false);
    }
  }, [user, userType, loadConversations, loadConversationDetails]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await aiChatService.deleteConversation(conversationId);
      
      // Remove from local state
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
      
      // If this was the current conversation, clear it
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(null);
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  }, [currentConversation]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    currentConversation,
    loading,
    error,
    sendMessage,
    escalateToAdmin,
    deleteConversation,
    loadConversations,
    loadConversationDetails,
    clearError
  };
};

export const useAIStats = () => {
  const [stats, setStats] = useState<AIStats | null>(null);
  const [health, setHealth] = useState<AIHealthResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiChatService.getAIStats();
      setStats(response.data);
    } catch (error: any) {
      setError(error.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiChatService.getAIHealth();
      setHealth(response.data);
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la vérification du statut');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStats();
    refreshHealth();
  }, [refreshStats, refreshHealth]);

  return {
    stats,
    health,
    loading,
    error,
    refreshStats,
    refreshHealth
  };
};
