export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    dbContext?: any;
    fromKnowledgeBase?: boolean;
    intent?: string;
    type?: string;
    submissionRequestId?: string;
    [key: string]: any;
  };
}

export interface AIConversation {
  _id: string;
  userId: string;
  role: 'admin' | 'entreprise';
  messages: AIMessage[];
  metadata: {
    entrepriseId?: string;
    resolved?: boolean;
    escalated?: boolean;
    escalationId?: string;
    context?: {
      nomEntreprise?: string;
      secteur?: string;
      statut?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  lastActivity: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIConversationSummary {
  _id: string;
  userId: {
    _id: string;
    nom: string;
    email: string;
    typeCompte: string;
  };
  role: 'admin' | 'entreprise';
  metadata: {
    entrepriseId?: {
      _id: string;
      identification: {
        nomEntreprise: string;
      };
    };
    escalated?: boolean;
    resolved?: boolean;
    escalationId?: string;
    context?: any;
  };
  lastActivity: Date;
  isActive: boolean;
  messageCount: number;
  lastMessage: string;
  canEscalate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageRequest {
  message: string;
  conversationId?: string;
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    conversationId: string;
    message: AIMessage;
    canEscalate?: boolean;
  };
}

export interface EscalateRequest {
  conversationId: string;
  details: string;
}

export interface EscalateResponse {
  success: boolean;
  message: string;
  data: {
    submissionRequestId: string;
    status: string;
  };
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: AIConversationSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ConversationDetailsResponse {
  success: boolean;
  data: AIConversation;
}

export interface AIStats {
  totalConversations: number;
  adminConversations: number;
  enterpriseConversations: number;
  escalatedConversations: number;
  recentConversations: number;
  popularIntents: Array<{
    _id: string;
    count: number;
  }>;
  escalationRate: string;
}

export interface AIStatsResponse {
  success: boolean;
  data: AIStats;
}

export interface AIHealthResponse {
  success: boolean;
  data: {
    aiService: {
      configured: boolean;
      provider: string;
      model: string;
    };
    knowledgeBase: {
      loaded: boolean;
      entries: number;
    };
    timestamp: string;
  };
}

// Types pour les composants UI
export interface AIChatModalProps {
  type: 'admin' | 'entreprise';
  open: boolean;
  onClose: () => void;
  initialConversationId?: string;
}

export interface MessageBubbleProps {
  message: AIMessage;
  isOwn: boolean;
  showTimestamp?: boolean;
}

export interface ConversationListProps {
  conversations: AIConversationSummary[];
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  loading?: boolean;
}

export interface EscalationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (details: string) => void;
  conversationId: string;
  loading?: boolean;
}

export interface AIFloatingButtonProps {
  type: 'admin' | 'entreprise';
  onClick: () => void;
  hasUnreadMessages?: boolean;
  badgeCount?: number;
}

// Types pour les hooks
export interface UseAIChatReturn {
  conversations: AIConversationSummary[];
  currentConversation: AIConversation | null;
  loading: boolean;
  error: string | null;
  sendMessage: (message: string, conversationId?: string) => Promise<void>;
  escalateToAdmin: (conversationId: string, details: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  loadConversationDetails: (conversationId: string) => Promise<void>;
  clearError: () => void;
}

export interface UseAIStatsReturn {
  stats: AIStats | null;
  health: AIHealthResponse['data'] | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  refreshHealth: () => Promise<void>;
}

// Types pour les erreurs
export interface AIError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  retryAfter?: string;
}

// Types pour les configurations
export interface AIConfig {
  maxMessageLength: number;
  maxConversationsPerPage: number;
  messageHistoryLimit: number;
  typingIndicatorDelay: number;
  autoScrollDelay: number;
}

// Types pour les intents (analyse des intentions)
export type AIIntent = 
  | 'analytics'
  | 'support'
  | 'help'
  | 'report'
  | 'general'
  | 'escalation'
  | 'feedback';

// Types pour les notifications
export interface AINotification {
  id: string;
  type: 'new_message' | 'escalation_update' | 'system_alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  conversationId?: string;
  actionUrl?: string;
}
