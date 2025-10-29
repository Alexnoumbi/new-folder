/**
 * Hook React optimisé pour l'assistant IA
 * Gestion d'état avancée avec cache et performance
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { optimizedAssistantService, AssistantResponse, AssistantStatus, AssistantHealth } from '../services/optimizedAssistantService';
import advancedAssistantService from '../services/advancedAssistantService';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant' | 'system';
  isUser: boolean; // Ajout pour compatibilité avec AssistantChat
  timestamp: Date;
  isLoading?: boolean;
  approach?: string;
  confidence?: number;
  responseTime?: number;
  metadata?: any;
  error?: boolean;
}

export interface AssistantState {
  // Messages et conversation
  messages: Message[];
  isTyping: boolean;
  isInitialized: boolean;
  
  // Suggestions et aide
  suggestions: string[];
  suggestionsLoading: boolean;
  
  // État du service
  serviceStatus: AssistantStatus | null;
  serviceHealth: AssistantHealth | null;
  lastHealthCheck: Date | null;
  
  // Performance et monitoring
  totalQuestions: number;
  averageResponseTime: number;
  successRate: number;
  
  // Interface
  isOpen: boolean;
  hasUnreadMessages: boolean;
  badgeCount: number;
}

export interface UseOptimizedAssistantOptions {
  autoHealthCheck?: boolean;
  healthCheckInterval?: number;
  maxMessages?: number;
  enableSuggestions?: boolean;
  cacheResponses?: boolean;
}

export const useOptimizedAssistant = (options: UseOptimizedAssistantOptions = {}) => {
  const {
    autoHealthCheck = true,
    healthCheckInterval = 60000, // 1 minute
    maxMessages = 50,
    enableSuggestions = true,
    cacheResponses = true
  } = options;

  const { user } = useAuth();
  
  // État principal
  const [state, setState] = useState<AssistantState>({
    messages: [],
    isTyping: false,
    isInitialized: false,
    suggestions: [],
    suggestionsLoading: false,
    serviceStatus: null,
    serviceHealth: null,
    lastHealthCheck: null,
    totalQuestions: 0,
    averageResponseTime: 0,
    successRate: 0,
    isOpen: false,
    hasUnreadMessages: false,
    badgeCount: 0
  });

  // Refs pour éviter les re-renders inutiles
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const responseTimesRef = useRef<number[]>([]);
  const successCountRef = useRef<number>(0);

  /**
   * Mise à jour sécurisée de l'état
   */
  const updateState = useCallback((updates: Partial<AssistantState>) => {
    setState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);

  /**
   * Ajout d'un message
   */
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      isUser: message.type === 'user' // Calcul automatique de isUser
    };

    setState(prevState => {
      const updatedMessages = [...prevState.messages, newMessage];
      
      // Limitation du nombre de messages
      if (updatedMessages.length > maxMessages) {
        updatedMessages.splice(0, updatedMessages.length - maxMessages);
      }

      // Mise à jour du badge si assistant fermé
      let newBadgeCount = prevState.badgeCount;
      let hasUnread = prevState.hasUnreadMessages;
      
      if (!prevState.isOpen && message.type === 'assistant' && !message.error) {
        newBadgeCount += 1;
        hasUnread = true;
      }

      return {
        ...prevState,
        messages: updatedMessages,
        badgeCount: newBadgeCount,
        hasUnreadMessages: hasUnread
      };
    });

    return newMessage.id;
  }, [maxMessages]);

  /**
   * Mise à jour d'un message existant
   */
  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setState(prevState => ({
      ...prevState,
      messages: prevState.messages.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    }));
  }, []);

  /**
   * Initialisation du service assistant
   */
  const initialize = useCallback(async () => {
    try {
      console.log('🚀 Initialisation assistant optimisé...');
      console.log('👤 Utilisateur:', user);
      console.log('🔧 Configuration:', { enableSuggestions, autoHealthCheck });
      
      updateState({ isInitialized: false });

      // Test de connectivité initial
      console.log('🔍 Test de connectivité avec le serveur...');
      try {
        const healthCheck = await optimizedAssistantService.healthCheck();
        console.log('📊 Résultat health check:', healthCheck);
        
        if (healthCheck?.status === 'healthy') {
          console.log('✅ Serveur assistant disponible');
        } else {
          console.warn('⚠️ Serveur assistant en mode dégradé');
        }
      } catch (error) {
        console.error('❌ Erreur de connectivité:', error);
        throw new Error('Impossible de se connecter au serveur assistant');
      }

      // Chargement des suggestions si activé
      if (enableSuggestions) {
        updateState({ suggestionsLoading: true });
        
        try {
          console.log('💡 Chargement des suggestions...');
          const suggestions = await optimizedAssistantService.getSuggestions();
          updateState({ suggestions, suggestionsLoading: false });
          console.log('✅ Suggestions chargées:', suggestions.length);
        } catch (error) {
          console.warn('⚠️ Impossible de charger les suggestions:', error);
          updateState({ suggestionsLoading: false });
        }
      }

      // Health check initial
      if (autoHealthCheck) {
        await performHealthCheck();
      }

      // Message de bienvenue
      const welcomeMessage = `Bonjour ${user?.nom || 'Utilisateur'} ! 👋

Je suis votre assistant IA optimisé. Je peux vous aider avec :

${user?.typeCompte === 'admin' ? 
  '🔧 **Administration**: Statistiques système, gestion des utilisateurs\n📊 **Monitoring**: Analyses de performance, alertes\n⚙️ **Configuration**: Paramètres et optimisation' :
  '💼 **Business**: Conseils stratégiques et opérationnels\n📈 **KPIs**: Analyse de vos indicateurs de performance\n📊 **Données**: Informations sur votre entreprise'
}

**Comment puis-je vous aider aujourd'hui ?**`;

      addMessage({
        content: welcomeMessage,
        type: 'assistant',
        isUser: false
      });

      updateState({ isInitialized: true });
      console.log('✅ Assistant optimisé initialisé');

    } catch (error) {
      console.error('❌ Erreur initialisation assistant:', error);
      
      addMessage({
        content: 'Désolé, je rencontre des difficultés lors de l\'initialisation. Veuillez réessayer dans quelques instants.',
        type: 'assistant',
        isUser: false,
        error: true
      });
    }
  }, [user, enableSuggestions, autoHealthCheck, addMessage, updateState]);

  /**
   * Poser une question à l'assistant
   */
  const askQuestion = useCallback(async (question: string) => {
    if (!question.trim()) return;

    console.log('🤔 Question posée:', question);
    
    // Message utilisateur
    const userMessageId = addMessage({
      content: question,
      type: 'user',
      isUser: true
    });

    // Message assistant en cours de traitement
    const assistantMessageId = addMessage({
      content: '',
      type: 'assistant',
      isUser: false,
      isLoading: true
    });

    updateState({ isTyping: true });

    try {
      const startTime = Date.now();
      
      // Appel au service avancé avec fallback
      const response = await advancedAssistantService.askQuestion(
        question,
        user?.typeCompte === 'admin' ? 'admin' : 'enterprise',
        user?.entrepriseId,
        `${Date.now()}_${Math.random()}`,
        state.messages.slice(-5).map(m => m.content)
      );

      const responseTime = Date.now() - startTime;

      // Mise à jour des métriques
      responseTimesRef.current.push(responseTime);
      if (responseTimesRef.current.length > 20) {
        responseTimesRef.current.shift(); // Garder seulement les 20 dernières
      }

      if (response.success) {
        successCountRef.current += 1;
      }

      setState(prevState => {
        const totalQuestions = prevState.totalQuestions + 1;
        const averageResponseTime = responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length;
        const successRate = (successCountRef.current / totalQuestions) * 100;

        return {
          ...prevState,
          totalQuestions,
          averageResponseTime: Math.round(averageResponseTime),
          successRate: Math.round(successRate * 100) / 100
        };
      });

      // Mise à jour du message assistant
      if (response.success && response.answer) {
        updateMessage(assistantMessageId, {
          content: response.answer,
          isLoading: false,
          approach: response.approach,
          confidence: response.confidence,
          responseTime: response.responseTime,
          metadata: response.metadata
        });

        console.log(`✅ Réponse reçue (${response.approach}, ${response.responseTime}ms)`);
      } else {
        updateMessage(assistantMessageId, {
          content: response.error || 'Désolé, je n\'ai pas pu traiter votre question.',
          isLoading: false,
          error: true
        });

        console.error('❌ Erreur dans la réponse:', response.error);
      }

    } catch (error: any) {
      console.error('❌ Erreur lors de la question:', error);
      
      updateMessage(assistantMessageId, {
        content: 'Désolé, je rencontre une erreur technique. Veuillez réessayer.',
        isLoading: false,
        error: true
      });
    } finally {
      updateState({ isTyping: false });
    }
  }, [user, addMessage, updateMessage, updateState]);

  /**
   * Health check du service
   */
  const performHealthCheck = useCallback(async () => {
    try {
      const [status, health] = await Promise.all([
        optimizedAssistantService.getServiceStatus(),
        optimizedAssistantService.healthCheck()
      ]);

      updateState({
        serviceStatus: status,
        serviceHealth: health,
        lastHealthCheck: new Date()
      });

      console.log('💚 Health check OK:', health?.status);

    } catch (error) {
      console.warn('⚠️ Health check échoué:', error);
      
      updateState({
        serviceHealth: {
          status: 'error',
          service: 'OptimizedAssistant',
          initialized: false,
          serviceMode: 'unknown',
          uptime: 0,
          timestamp: new Date().toISOString()
        },
        lastHealthCheck: new Date()
      });
    }
  }, [updateState]);

  /**
   * Ouverture de l'assistant
   */
  const openAssistant = useCallback(() => {
    updateState({
      isOpen: true,
      hasUnreadMessages: false,
      badgeCount: 0
    });
  }, [updateState]);

  /**
   * Fermeture de l'assistant
   */
  const closeAssistant = useCallback(() => {
    updateState({ isOpen: false });
  }, [updateState]);

  /**
   * Nettoyage de l'historique
   */
  const clearHistory = useCallback(() => {
    updateState({
      messages: [],
      badgeCount: 0,
      hasUnreadMessages: false
    });
  }, [updateState]);

  /**
   * Utilisation d'une suggestion
   */
  const useSuggestion = useCallback((suggestion: string) => {
    askQuestion(suggestion);
  }, [askQuestion]);

  /**
   * Rechargement de la base de connaissances (admin)
   */
  const reloadKnowledge = useCallback(async (): Promise<boolean> => {
    if (user?.typeCompte !== 'admin') {
      console.warn('⚠️ Rechargement non autorisé (admin requis)');
      return false;
    }

    try {
      addMessage({
        content: '🔄 Rechargement de la base de connaissances en cours...',
        type: 'system',
        isUser: false
      });

      const result = await optimizedAssistantService.reloadKnowledge();
      
      if (result.success) {
        addMessage({
          content: '✅ Base de connaissances rechargée avec succès !',
          type: 'system',
          isUser: false
        });
        
        // Rafraîchir les suggestions
        if (enableSuggestions) {
          const suggestions = await optimizedAssistantService.getSuggestions();
          updateState({ suggestions });
        }
        
        return true;
      } else {
        addMessage({
          content: `❌ Erreur lors du rechargement : ${result.error}`,
          type: 'system',
          isUser: false,
          error: true
        });
        return false;
      }

    } catch (error: any) {
      console.error('❌ Erreur rechargement:', error);
      addMessage({
        content: '❌ Erreur technique lors du rechargement.',
        type: 'system',
        isUser: false,
        error: true
      });
      return false;
    }
  }, [user, enableSuggestions, addMessage, updateState]);

  // Effect pour l'initialisation
  useEffect(() => {
    if (user && !state.isInitialized) {
      initialize();
    }
  }, [user, state.isInitialized, initialize]);

  // Effect pour le health check automatique
  useEffect(() => {
    if (autoHealthCheck && state.isInitialized) {
      // Health check initial
      performHealthCheck();
      
      // Health check périodique
      healthCheckIntervalRef.current = setInterval(performHealthCheck, healthCheckInterval);

      return () => {
        if (healthCheckIntervalRef.current) {
          clearInterval(healthCheckIntervalRef.current);
        }
      };
    }
  }, [autoHealthCheck, state.isInitialized, performHealthCheck, healthCheckInterval]);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
      optimizedAssistantService.cleanup();
    };
  }, []);

  return {
    // État
    ...state,
    
    // Actions
    askQuestion,
    openAssistant,
    closeAssistant,
    clearHistory,
    useSuggestion,
    reloadKnowledge,
    performHealthCheck,
    
    // Utilitaires
    initialize,
    isHealthy: state.serviceHealth?.status === 'healthy',
    canReload: user?.typeCompte === 'admin',
    
    // Métriques calculées
    metrics: {
      totalQuestions: state.totalQuestions,
      averageResponseTime: state.averageResponseTime,
      successRate: state.successRate,
      cacheStats: optimizedAssistantService.getCacheStats()
    }
  };
};
