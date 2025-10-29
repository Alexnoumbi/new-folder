/**
 * useSmartAssistant - Hook personnalisé pour gestion avancée de l'assistant
 * Gestion d'état, cache intelligent, et fonctionnalités avancées
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { optimizedAssistantService } from '../services/optimizedAssistantService';

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  confidence?: number;
  approach?: string;
  metadata?: any;
  feedback?: 'positive' | 'negative' | null;
}

export interface UserPreferences {
  language: string;
  responseStyle: 'concise' | 'detailed';
  showConfidence: boolean;
  enableSuggestions: boolean;
}

export interface ConversationContext {
  userId: string;
  userRole: 'admin' | 'enterprise';
  enterpriseId?: string;
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  totalMessages: number;
  userPreferences: UserPreferences;
}

export interface SmartAssistantState {
  // Messages et conversation
  messages: Message[];
  isTyping: boolean;
  isInitialized: boolean;
  
  // Suggestions et contexte
  suggestions: string[];
  contextHistory: string[];
  
  // Santé du service
  serviceHealth: {
    isHealthy: boolean;
    status: string;
    lastCheck: Date;
    responseTime: number;
  };
  
  // Métriques et statistiques
  metrics: {
    totalQuestions: number;
    averageResponseTime: number;
    successRate: number;
    userSatisfaction: number;
    mostUsedFeatures: string[];
  };
  
  // Fonctionnalités avancées
  conversationContext: ConversationContext | null;
  personalizedSuggestions: string[];
  quickActions: Array<{
    id: string;
    label: string;
    icon: string;
    action: () => void;
  }>;
  
  // Cache et performance
  responseCache: Map<string, Message>;
  embeddingCache: Map<string, number[]>;
  
  // État de l'interface
  isMinimized: boolean;
  currentTheme: 'light' | 'dark' | 'auto';
  showAdvancedFeatures: boolean;
}

export interface SmartAssistantActions {
  // Actions de base
  askQuestion: (question: string) => Promise<void>;
  clearHistory: () => void;
  reloadKnowledge: () => Promise<void>;
  
  // Actions avancées
  useSuggestion: (suggestion: string) => Promise<void>;
  provideFeedback: (messageId: string, feedback: 'positive' | 'negative') => void;
  exportConversation: () => void;
  shareConversation: (recipients: string[]) => void;
  
  // Actions de personnalisation
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  toggleAdvancedFeatures: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  
  // Actions de contexte
  addToContext: (context: string) => void;
  clearContext: () => void;
  getContextSummary: () => string;
  
  // Actions de cache
  clearCache: () => void;
  optimizeCache: () => void;
  
  // Actions d'interface
  minimizeChat: () => void;
  maximizeChat: () => void;
  toggleMinimized: () => void;
}

const useSmartAssistant = (
  userRole: 'admin' | 'enterprise',
  enterpriseId?: string,
  userId?: string
): SmartAssistantState & SmartAssistantActions => {
  
  // État principal
  const [state, setState] = useState<SmartAssistantState>({
    messages: [],
    isTyping: false,
    isInitialized: false,
    suggestions: [],
    contextHistory: [],
    serviceHealth: {
      isHealthy: false,
      status: 'initializing',
      lastCheck: new Date(),
      responseTime: 0
    },
    metrics: {
      totalQuestions: 0,
      averageResponseTime: 0,
      successRate: 0,
      userSatisfaction: 0,
      mostUsedFeatures: []
    },
    conversationContext: null,
    personalizedSuggestions: [],
    quickActions: [],
    responseCache: new Map(),
    embeddingCache: new Map(),
    isMinimized: false,
    currentTheme: 'auto',
    showAdvancedFeatures: userRole === 'admin'
  });

  // Références pour la persistance
  const sessionIdRef = useRef<string>(generateSessionId());
  const lastActivityRef = useRef<Date>(new Date());
  const contextRef = useRef<string[]>([]);

  // Génération d'ID de session unique
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialisation du contexte de conversation
  useEffect(() => {
    if (userId && userRole) {
      const conversationContext: ConversationContext = {
        userId,
        userRole,
        enterpriseId,
        sessionId: sessionIdRef.current,
        startTime: new Date(),
        lastActivity: new Date(),
        totalMessages: 0,
        userPreferences: {
          language: 'fr',
          responseStyle: 'detailed',
          showConfidence: true,
          enableSuggestions: true
        }
      };

      setState(prev => ({
        ...prev,
        conversationContext,
        isInitialized: true
      }));

      // Chargement des suggestions personnalisées
      loadPersonalizedSuggestions(userRole, enterpriseId);
      
      // Chargement des actions rapides
      loadQuickActions(userRole);
      
      // Vérification de la santé du service
      checkServiceHealth();
    }
  }, [userId, userRole, enterpriseId]);

  // Chargement des suggestions personnalisées
  const loadPersonalizedSuggestions = async (role: 'admin' | 'enterprise', entId?: string) => {
    try {
      const suggestions = await optimizedAssistantService.getSuggestions();
      setState(prev => ({
        ...prev,
        personalizedSuggestions: suggestions
      }));
    } catch (error) {
      console.error('Erreur chargement suggestions:', error);
    }
  };

  // Chargement des actions rapides
  const loadQuickActions = (role: 'admin' | 'enterprise') => {
    const actions = role === 'admin' 
      ? [
          {
            id: 'view_stats',
            label: 'Voir les statistiques',
            icon: 'Assessment',
            action: () => askQuestion('Affiche-moi les statistiques globales du système')
          },
          {
            id: 'user_management',
            label: 'Gérer les utilisateurs',
            icon: 'People',
            action: () => askQuestion('Comment gérer les utilisateurs ?')
          },
          {
            id: 'system_config',
            label: 'Configuration système',
            icon: 'Settings',
            action: () => askQuestion('Comment configurer le système ?')
          }
        ]
      : [
          {
            id: 'view_kpis',
            label: 'Mes KPIs',
            icon: 'TrendingUp',
            action: () => askQuestion('Affiche-moi mes KPIs')
          },
          {
            id: 'create_report',
            label: 'Créer un rapport',
            icon: 'Assessment',
            action: () => askQuestion('Comment créer un rapport ?')
          },
          {
            id: 'view_performance',
            label: 'Performance',
            icon: 'Speed',
            action: () => askQuestion('Comment améliorer mes performances ?')
          }
        ];

    setState(prev => ({
      ...prev,
      quickActions: actions
    }));
  };

  // Vérification de la santé du service
  const checkServiceHealth = async () => {
    try {
      const health = await optimizedAssistantService.healthCheck();
      
      if (health) {
        setState(prev => ({
          ...prev,
          serviceHealth: {
            isHealthy: health.status === 'healthy',
            status: health.status,
            lastCheck: new Date(),
            responseTime: health.uptime || 0
          }
        }));
      } else {
        setState(prev => ({
          ...prev,
          serviceHealth: {
            isHealthy: false,
            status: 'error',
            lastCheck: new Date(),
            responseTime: 0
          }
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        serviceHealth: {
          isHealthy: false,
          status: 'error',
          lastCheck: new Date(),
          responseTime: 0
        }
      }));
    }
  };

  // Pose de question avec gestion avancée
  const askQuestion = useCallback(async (question: string) => {
    if (!question.trim() || state.isTyping) return;

    const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Ajout du message utilisateur
    const userMessage: Message = {
      id: questionId,
      content: question.trim(),
      isUser: true,
      timestamp: new Date(),
      metadata: {
        sessionId: sessionIdRef.current,
        userRole: state.conversationContext?.userRole,
        enterpriseId: state.conversationContext?.enterpriseId
      }
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
      contextHistory: [...prev.contextHistory, question.trim()]
    }));

    lastActivityRef.current = new Date();

    try {
      // Vérification du cache
      const cacheKey = `${question}_${state.conversationContext?.userRole}_${state.conversationContext?.enterpriseId}`;
      const cachedResponse = state.responseCache.get(cacheKey);
      
      if (cachedResponse) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, cachedResponse],
          isTyping: false
        }));
        return;
      }

      // Appel au service
      const response = await optimizedAssistantService.askQuestion(
        question.trim(),
        state.conversationContext?.enterpriseId || enterpriseId
      );

      const assistantMessage: Message = {
        id: `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: response.answer || 'Réponse non disponible',
        isUser: false,
        timestamp: new Date(),
        confidence: response.confidence,
        approach: response.approach,
        metadata: {
          ...response.metadata,
          sessionId: sessionIdRef.current,
          responseTime: response.responseTime
        }
      };

      // Mise en cache
      state.responseCache.set(cacheKey, assistantMessage);

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isTyping: false,
        metrics: {
          ...prev.metrics,
          totalQuestions: prev.metrics.totalQuestions + 1,
          averageResponseTime: calculateAverageResponseTime(
            prev.metrics.averageResponseTime,
            prev.metrics.totalQuestions,
            response.responseTime || 0
          )
        }
      }));

      // Mise à jour du contexte
      contextRef.current.push(question.trim());
      if (contextRef.current.length > 10) {
        contextRef.current = contextRef.current.slice(-10);
      }

    } catch (error) {
      console.error('Erreur lors de la question:', error);
      
      const errorMessage: Message = {
        id: `e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        isUser: false,
        timestamp: new Date(),
        confidence: 0,
        approach: 'error',
        metadata: { error: (error as Error).message }
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isTyping: false
      }));
    }
  }, [state.isTyping, state.conversationContext, state.responseCache, userRole, enterpriseId]);

  // Calcul de la moyenne des temps de réponse
  const calculateAverageResponseTime = (
    currentAverage: number,
    totalQuestions: number,
    newResponseTime: number
  ): number => {
    return (currentAverage * totalQuestions + newResponseTime) / (totalQuestions + 1);
  };

  // Utilisation d'une suggestion
  const useSuggestion = useCallback(async (suggestion: string) => {
    await askQuestion(suggestion);
  }, [askQuestion]);

  // Effacement de l'historique
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      contextHistory: []
    }));
    contextRef.current = [];
  }, []);

  // Rechargement des connaissances
  const reloadKnowledge = useCallback(async () => {
    try {
      await optimizedAssistantService.reloadKnowledge();
      await loadPersonalizedSuggestions(userRole, enterpriseId);
    } catch (error) {
      console.error('Erreur rechargement:', error);
    }
  }, [userRole, enterpriseId]);

  // Feedback utilisateur
  const provideFeedback = useCallback((messageId: string, feedback: 'positive' | 'negative') => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId ? { ...msg, feedback } : msg
      ),
      metrics: {
        ...prev.metrics,
        userSatisfaction: calculateUserSatisfaction(prev.messages, feedback)
      }
    }));
  }, []);

  // Calcul de la satisfaction utilisateur
  const calculateUserSatisfaction = (messages: Message[], newFeedback: 'positive' | 'negative'): number => {
    const feedbackMessages = messages.filter(msg => msg.feedback);
    const positiveCount = feedbackMessages.filter(msg => msg.feedback === 'positive').length;
    const totalFeedback = feedbackMessages.length + 1;
    const newPositiveCount = newFeedback === 'positive' ? positiveCount + 1 : positiveCount;
    
    return (newPositiveCount / totalFeedback) * 100;
  };

  // Export de conversation
  const exportConversation = useCallback(() => {
    const conversationData = {
      sessionId: sessionIdRef.current,
      startTime: state.conversationContext?.startTime,
      endTime: new Date(),
      messages: state.messages,
      metrics: state.metrics,
      userRole: state.conversationContext?.userRole
    };

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_${sessionIdRef.current}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.messages, state.metrics, state.conversationContext]);

  // Partage de conversation
  const shareConversation = useCallback((recipients: string[]) => {
    // TODO: Implémenter le partage
    console.log('Partage de conversation vers:', recipients);
  }, []);

  // Mise à jour des préférences
  const updatePreferences = useCallback((preferences: Partial<UserPreferences>) => {
    setState(prev => ({
      ...prev,
      conversationContext: prev.conversationContext ? {
        ...prev.conversationContext,
        userPreferences: {
          ...prev.conversationContext.userPreferences,
          ...preferences
        }
      } : null
    }));
  }, []);

  // Basculement des fonctionnalités avancées
  const toggleAdvancedFeatures = useCallback(() => {
    setState(prev => ({
      ...prev,
      showAdvancedFeatures: !prev.showAdvancedFeatures
    }));
  }, []);

  // Changement de thème
  const setTheme = useCallback((theme: 'light' | 'dark' | 'auto') => {
    setState(prev => ({
      ...prev,
      currentTheme: theme
    }));
  }, []);

  // Ajout au contexte
  const addToContext = useCallback((context: string) => {
    contextRef.current.push(context);
    setState(prev => ({
      ...prev,
      contextHistory: [...prev.contextHistory, context]
    }));
  }, []);

  // Effacement du contexte
  const clearContext = useCallback(() => {
    contextRef.current = [];
    setState(prev => ({
      ...prev,
      contextHistory: []
    }));
  }, []);

  // Résumé du contexte
  const getContextSummary = useCallback(() => {
    return contextRef.current.slice(-5).join(' | ');
  }, []);

  // Effacement du cache
  const clearCache = useCallback(() => {
    setState(prev => ({
      ...prev,
      responseCache: new Map(),
      embeddingCache: new Map()
    }));
  }, []);

  // Optimisation du cache
  const optimizeCache = useCallback(() => {
    // Garder seulement les 100 entrées les plus récentes
    const entries = Array.from(state.responseCache.entries());
    const optimizedCache = new Map(entries.slice(-100));
    
    setState(prev => ({
      ...prev,
      responseCache: optimizedCache
    }));
  }, [state.responseCache]);

  // Actions d'interface
  const minimizeChat = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: true }));
  }, []);

  const maximizeChat = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: false }));
  }, []);

  const toggleMinimized = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  // Suggestions basées sur le contexte
  const suggestions = state.personalizedSuggestions.length > 0 
    ? state.personalizedSuggestions 
    : state.suggestions;

  return {
    ...state,
    suggestions,
    askQuestion,
    useSuggestion,
    clearHistory,
    reloadKnowledge,
    provideFeedback,
    exportConversation,
    shareConversation,
    updatePreferences,
    toggleAdvancedFeatures,
    setTheme,
    addToContext,
    clearContext,
    getContextSummary,
    clearCache,
    optimizeCache,
    minimizeChat,
    maximizeChat,
    toggleMinimized
  };
};

export default useSmartAssistant;
