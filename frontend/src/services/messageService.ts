// Interface Message
export interface Message {
  id: string;
  content: string;
  sender: string;
  subject: string;
  date: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  status: 'unread' | 'read' | 'replied';
  replied: boolean;
}

// Fonction pour récupérer les messages
export const getMessages = async (): Promise<Message[]> => {
  try {
    const response = await fetch('/api/messages');
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des messages');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur getMessages:', error);
    return [];
  }
};

// Fonction pour envoyer un message
export const sendMessage = async (messageData: Partial<Message>): Promise<Message> => {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messageData)
  });
  if (!response.ok) {
    throw new Error('Erreur lors de l\'envoi du message');
  }
  return await response.json();
};

// Fonction pour marquer un message comme lu
export const markAsRead = async (messageId: string): Promise<void> => {
  const response = await fetch(`/api/messages/${messageId}/read`, {
    method: 'PUT'
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour du message');
  }
}; 