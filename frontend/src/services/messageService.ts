import api from './api';

// Interface Message
export interface Message {
  _id?: string;
  id?: string;
  content: string;
  sender: any;
  recipient?: any;
  subject?: string;
  date?: string;
  createdAt?: string;
  read: boolean;
  priority?: 'high' | 'medium' | 'low';
  status?: 'unread' | 'read' | 'replied';
  replied?: boolean;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  entrepriseId?: string;
}

export interface SendMessageData {
  recipientId: string;
  entrepriseId: string;
  content: string;
  subject?: string;
  priority?: 'high' | 'medium' | 'low';
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

// Fonction pour récupérer les messages d'une entreprise
export const getMessagesByEntreprise = async (entrepriseId: string): Promise<Message[]> => {
  try {
    const response = await api.get(`/messages/entreprise/${entrepriseId}`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Erreur getMessagesByEntreprise:', error);
    return [];
  }
};

// Fonction pour récupérer les messages (ancienne version pour compatibilité)
export const getMessages = async (): Promise<Message[]> => {
  try {
    const response = await api.get('/messages/conversations');
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Erreur getMessages:', error);
    return [];
  }
};

// Fonction pour envoyer un message
export const sendMessage = async (messageData: SendMessageData): Promise<Message> => {
  const response = await api.post('/messages', messageData);
  return response.data.data || response.data;
};

// Fonction pour marquer un message comme lu
export const markAsRead = async (messageId: string): Promise<void> => {
  await api.put(`/messages/${messageId}/read`);
};

// Fonction pour marquer toute une conversation comme lue
export const markConversationAsRead = async (entrepriseId: string): Promise<void> => {
  await api.put(`/messages/entreprise/${entrepriseId}/mark-read`);
};

// Fonction pour supprimer un message
export const deleteMessage = async (messageId: string): Promise<void> => {
  await api.delete(`/messages/${messageId}`);
};

// Fonction pour obtenir les statistiques de messages
export const getMessageStats = async (): Promise<any> => {
  const response = await api.get('/messages/stats');
  return response.data.data || response.data;
}; 