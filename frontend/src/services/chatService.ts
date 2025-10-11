import axios from 'axios';

const API_URL = 'http://localhost:5000/api/messages';

export interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  } | string;
  recipient?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  } | string;
  entrepriseId: string | any;
  content: string;
  read: boolean;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  entreprise: {
    _id: string;
    identification?: {
      nomEntreprise: string;
    };
    nom?: string;
    name?: string;
  };
  lastMessage: ChatMessage;
  unreadCount: number;
  totalMessages: number;
}

export interface MessageStats {
  total: number;
  unread: number;
  read: number;
  topEntreprises: Array<{
    _id: string;
    count: number;
    unreadCount: number;
  }>;
}

const chatService = {
  // Obtenir toutes les conversations
  getConversations: async (): Promise<Conversation[]> => {
    const response = await axios.get(`${API_URL}/conversations`);
    return response.data.data || response.data || [];
  },

  // Obtenir les messages d'une entreprise
  getMessagesByEntreprise: async (entrepriseId: string): Promise<ChatMessage[]> => {
    const response = await axios.get(`${API_URL}/entreprise/${entrepriseId}`);
    return response.data.data || response.data || [];
  },

  // Envoyer un message
  sendMessage: async (data: {
    entrepriseId: string;
    recipientId?: string;
    content: string;
    attachments?: Array<{ name: string; url: string; type: string }>;
  }): Promise<ChatMessage> => {
    const response = await axios.post(API_URL, data);
    return response.data.data;
  },

  // Marquer un message comme lu
  markAsRead: async (messageId: string): Promise<void> => {
    await axios.put(`${API_URL}/${messageId}/read`);
  },

  // Marquer toute une conversation comme lue
  markConversationAsRead: async (entrepriseId: string): Promise<void> => {
    await axios.put(`${API_URL}/entreprise/${entrepriseId}/mark-read`);
  },

  // Supprimer un message
  deleteMessage: async (messageId: string): Promise<void> => {
    await axios.delete(`${API_URL}/${messageId}`);
  },

  // Obtenir les statistiques
  getStats: async (): Promise<MessageStats> => {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data.data;
  },

  // Rechercher dans les messages
  search: async (query: string, entrepriseId?: string): Promise<ChatMessage[]> => {
    const response = await axios.get(`${API_URL}/search`, {
      params: { query, entrepriseId }
    });
    return response.data.data || [];
  }
};

export default chatService;

