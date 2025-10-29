/**
 * Types TypeScript complets pour l'assistant IA
 * Définitions de types pour une meilleure maintenance et sécurité
 */

// Types de base pour les messages
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  confidence?: number;
  approach?: 'rules' | 'embeddings' | 'instant' | 'fallback' | 'error';
  metadata?: MessageMetadata;
  feedback?: 'positive' | 'negative' | null;
  attachments?: Attachment[];
}

export interface MessageMetadata {
  sessionId?: string;
  userRole?: 'admin' | 'enterprise';
  enterpriseId?: string;
  responseTime?: number;
  pattern?: string;
  handler?: string;
  category?: string;
  keywords?: string[];
  error?: string;
  [key: string]: any;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'file';
  url: string;
  size: number;
  uploadedAt: Date;
}

// Types pour les suggestions
export interface Suggestion {
  id: string;
  text: string;
  category: 'general' | 'kpi' | 'reports' | 'settings' | 'help';
  confidence: number;
  metadata?: {
    targetAction?: string;
    parameters?: Record<string, any>;
    userRole?: 'admin' | 'enterprise';
  };
}

export interface PersonalizedSuggestion extends Suggestion {
  basedOn: 'history' | 'preferences' | 'context' | 'trends';
  relevanceScore: number;
  lastUsed?: Date;
  usageCount: number;
}

// Types pour le contexte de conversation
export interface ConversationContext {
  userId: string;
  userRole: 'admin' | 'enterprise';
  enterpriseId?: string;
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  totalMessages: number;
  userPreferences: UserPreferences;
  currentTopic?: string;
  relatedTopics: string[];
}

export interface UserPreferences {
  language: 'fr' | 'en';
  responseStyle: 'concise' | 'detailed' | 'conversational';
  showConfidence: boolean;
  enableSuggestions: boolean;
  enableAdvancedFeatures: boolean;
  autoSaveConversations: boolean;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    newSuggestions: boolean;
    serviceUpdates: boolean;
    performanceAlerts: boolean;
  };
}

// Types pour la santé du service
export interface ServiceHealth {
  isHealthy: boolean;
  status: 'active' | 'degraded' | 'error' | 'initializing';
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  uptime: number;
  version: string;
  features: ServiceFeature[];
}

export interface ServiceFeature {
  name: string;
  enabled: boolean;
  status: 'active' | 'disabled' | 'error';
  lastUsed?: Date;
  usageCount: number;
}

// Types pour les métriques et statistiques
export interface AssistantMetrics {
  totalQuestions: number;
  averageResponseTime: number;
  successRate: number;
  userSatisfaction: number;
  mostUsedFeatures: FeatureUsage[];
  responseDistribution: ResponseDistribution;
  performanceHistory: PerformancePoint[];
  errorLog: ErrorLogEntry[];
}

export interface FeatureUsage {
  feature: string;
  count: number;
  lastUsed: Date;
  averageRating: number;
}

export interface ResponseDistribution {
  rules: number;
  embeddings: number;
  instant: number;
  fallback: number;
  error: number;
}

export interface PerformancePoint {
  timestamp: Date;
  responseTime: number;
  success: boolean;
  approach: string;
  confidence: number;
}

export interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  error: string;
  context: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

// Types pour les actions rapides
export interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: string;
  category: 'navigation' | 'data' | 'settings' | 'help';
  action: () => void | Promise<void>;
  requiresConfirmation?: boolean;
  userRole?: 'admin' | 'enterprise' | 'both';
  enabled: boolean;
  usageCount: number;
}

// Types pour le cache et la performance
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: Date;
}

export interface CacheStats {
  size: number;
  hitRate: number;
  missRate: number;
  averageAccessTime: number;
  oldestEntry: Date;
  newestEntry: Date;
}

// Types pour les réponses de l'API
export interface AssistantResponse {
  success: boolean;
  question: string;
  answer: string;
  approach: string;
  confidence: number;
  responseTime: number;
  service: string;
  metadata: MessageMetadata;
  suggestions?: string[];
  relatedQuestions?: string[];
  timestamp: Date;
}

export interface AssistantError {
  success: false;
  error: string;
  code: string;
  details?: any;
  timestamp: Date;
}

// Types pour les services backend
export interface EmbeddingService {
  generateEmbedding(text: string): Promise<number[]>;
  generateEmbeddings(texts: string[]): Promise<number[][]>;
  getStats(): EmbeddingStats;
}

export interface EmbeddingStats {
  isInitialized: boolean;
  dimension: number;
  vocabularySize: number;
  cacheSize: number;
  serviceType: 'primary' | 'fallback';
  totalRequests: number;
  averageProcessingTime: number;
}

export interface VectorStore {
  addVectors(vectors: number[][], metadata: any[]): Promise<void>;
  search(queryVector: number[], k?: number, threshold?: number): Promise<SearchResult[]>;
  searchWithFilter(queryVector: number[], k?: number, filter?: any): Promise<SearchResult[]>;
  getStats(): VectorStoreStats;
}

export interface SearchResult {
  similarity: number;
  metadata: any;
  index: number;
}

export interface VectorStoreStats {
  isInitialized: boolean;
  totalVectors: number;
  dimension: number;
  metadataCount: number;
  deletedCount: number;
  indexType: string;
}

// Types pour les composants React
export interface AssistantChatProps {
  userRole: 'admin' | 'enterprise';
  enterpriseId?: string;
  userId?: string;
  onClose?: () => void;
  initialMessage?: string;
  showAdvancedFeatures?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface AssistantModalProps extends AssistantChatProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
}

export interface AssistantFloatingButtonProps {
  userRole: 'admin' | 'enterprise';
  enterpriseId?: string;
  userId?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showNotification?: boolean;
  notificationCount?: number;
}

// Types pour les hooks
export interface UseSmartAssistantReturn {
  // État
  messages: Message[];
  isTyping: boolean;
  isInitialized: boolean;
  suggestions: string[];
  contextHistory: string[];
  serviceHealth: ServiceHealth;
  metrics: AssistantMetrics;
  conversationContext: ConversationContext | null;
  personalizedSuggestions: PersonalizedSuggestion[];
  quickActions: QuickAction[];
  responseCache: Map<string, Message>;
  embeddingCache: Map<string, number[]>;
  isMinimized: boolean;
  currentTheme: 'light' | 'dark' | 'auto';
  showAdvancedFeatures: boolean;

  // Actions
  askQuestion: (question: string) => Promise<void>;
  useSuggestion: (suggestion: string) => Promise<void>;
  clearHistory: () => void;
  reloadKnowledge: () => Promise<void>;
  provideFeedback: (messageId: string, feedback: 'positive' | 'negative') => void;
  exportConversation: () => void;
  shareConversation: (recipients: string[]) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  toggleAdvancedFeatures: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  addToContext: (context: string) => void;
  clearContext: () => void;
  getContextSummary: () => string;
  clearCache: () => void;
  optimizeCache: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
  toggleMinimized: () => void;
}

// Types pour les événements
export interface AssistantEvent {
  type: 'question_asked' | 'response_received' | 'feedback_provided' | 'suggestion_used' | 'error_occurred';
  timestamp: Date;
  data: any;
  sessionId: string;
  userId: string;
}

// Types pour la configuration
export interface AssistantConfig {
  apiEndpoint: string;
  timeout: number;
  retryAttempts: number;
  cacheSize: number;
  enableAnalytics: boolean;
  enableFeedback: boolean;
  enableSuggestions: boolean;
  enableAdvancedFeatures: boolean;
  defaultLanguage: string;
  maxMessageLength: number;
  maxHistoryLength: number;
}

// Types pour les plugins et extensions
export interface AssistantPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  hooks: {
    beforeQuestion?: (question: string) => string;
    afterResponse?: (response: AssistantResponse) => AssistantResponse;
    onError?: (error: Error) => void;
  };
}

export interface AssistantExtension {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  props?: any;
  enabled: boolean;
  userRole?: 'admin' | 'enterprise' | 'both';
}

// Types utilitaires
export type UserRole = 'admin' | 'enterprise';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResponseApproach = 'rules' | 'embeddings' | 'instant' | 'fallback' | 'error';
export type FeedbackType = 'positive' | 'negative';
export type ServiceStatus = 'active' | 'degraded' | 'error' | 'initializing';

// Types pour les constantes
const ASSISTANT_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_HISTORY_LENGTH: 100,
  CACHE_TTL: 300000, // 5 minutes
  RESPONSE_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  CONFIDENCE_THRESHOLDS: {
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.4
  }
} as const;

export { ASSISTANT_CONSTANTS };
