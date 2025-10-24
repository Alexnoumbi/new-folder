import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Divider,
  Fab,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Close,
  Send,
  SmartToy,
  Support,
  History,
  Add,
  KeyboardArrowUp,
  KeyboardArrowDown,
  ContentCopy,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { AIChatModalProps, AIMessage, AIConversation } from '../../types/aiChat.types';
import { aiChatService } from '../../services/aiChatService';
import MessageBubble from './MessageBubble';
import ConversationList from './ConversationList';
import EscalationDialog from './EscalationDialog';

const AIChatModal: React.FC<AIChatModalProps> = ({
  type,
  open,
  onClose,
  initialConversationId
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // State
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(initialConversationId || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConversations, setShowConversations] = useState(false);
  const [showEscalationDialog, setShowEscalationDialog] = useState(false);
  const [canEscalate, setCanEscalate] = useState(false);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Load conversations on open
  useEffect(() => {
    if (open) {
      loadConversations();
      if (currentConversationId) {
        loadConversationDetails(currentConversationId);
      }
    }
  }, [open, currentConversationId]);

  const loadConversations = async () => {
    try {
      const response = await aiChatService.getConversations(1, 50, type);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    }
  };

  const loadConversationDetails = async (conversationId: string) => {
    try {
      setLoading(true);
      const response = await aiChatService.getConversationDetails(conversationId);
      setMessages(response.data.messages);
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      setError('Impossible de charger la conversation');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const validation = aiChatService.validateMessage(message);
    if (!validation.isValid) {
      setError(validation.error || 'Message invalide');
      return;
    }

    const userMessage: AIMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    setError(null);

    try {
      const response = await aiChatService.sendMessage(
        userMessage.content,
        type,
        currentConversationId || undefined
      );

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response.data.message.content,
        timestamp: new Date(),
        metadata: response.data.message.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentConversationId(response.data.conversationId);
      setCanEscalate(response.data.canEscalate || false);

      // Reload conversations to update the list
      loadConversations();
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'envoi du message');
      // Remove the user message if sending failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setCanEscalate(false);
    setError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleEscalate = async (details: string) => {
    if (!currentConversationId) return;

    try {
      await aiChatService.escalateToAdmin(currentConversationId, details);
      setShowEscalationDialog(false);
      setCanEscalate(false);
      
      // Add a confirmation message
      const confirmationMessage: AIMessage = {
        role: 'assistant',
        content: `✅ Votre demande a été escaladée vers un administrateur.\n\nUn administrateur vous contactera dans les plus brefs délais. Vous pouvez suivre l'avancement de votre demande dans la section "Support IA" de votre tableau de bord.`,
        timestamp: new Date(),
        metadata: {
          type: 'escalation_confirmation'
        }
      };

      setMessages(prev => [...prev, confirmationMessage]);
      loadConversations();
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'escalade');
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await aiChatService.deleteConversation(conversationId);
      loadConversations();
      
      if (conversationId === currentConversationId) {
        startNewConversation();
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la suppression');
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'admin':
        return 'Assistant IA - Administrateur';
      case 'entreprise':
        return 'Assistant IA - Support';
      default:
        return 'Assistant IA';
    }
  };

  const getModalDescription = () => {
    switch (type) {
      case 'admin':
        return 'Posez vos questions sur les données et obtenez des analyses en temps réel';
      case 'entreprise':
        return 'Obtenez de l\'aide pour utiliser la plateforme ou escaladez vers un administrateur';
      default:
        return 'Assistant intelligent pour vous aider';
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            borderRadius: 3,
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: alpha(
                    type === 'admin' ? theme.palette.primary.main : theme.palette.secondary.main,
                    0.1
                  )
                }}
              >
                <SmartToy 
                  sx={{ 
                    color: type === 'admin' ? 'primary.main' : 'secondary.main',
                    fontSize: 28 
                  }} 
                />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {getModalTitle()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getModalDescription()}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* New Chat Button */}
              <Tooltip title="Nouvelle conversation">
                <IconButton onClick={startNewConversation} size="small">
                  <Add />
                </IconButton>
              </Tooltip>

              {/* History Button */}
              <Tooltip title="Historique des conversations">
                <IconButton 
                  onClick={() => setShowConversations(!showConversations)} 
                  size="small"
                >
                  <History />
                </IconButton>
              </Tooltip>

              {/* Close Button */}
              <IconButton onClick={onClose} size="small">
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', height: '100%' }}>
          {/* Conversations Sidebar */}
          {showConversations && (
            <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider' }}>
              <ConversationList
                conversations={conversations}
                onSelectConversation={loadConversationDetails}
                onDeleteConversation={handleDeleteConversation}
                loading={loading}
              />
            </Box>
          )}

          {/* Chat Area */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Messages */}
            <Box 
              sx={{ 
                flex: 1, 
                overflow: 'auto', 
                p: 2,
                bgcolor: alpha(theme.palette.grey[50], 0.5)
              }}
            >
              {messages.length === 0 && !loading ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center'
                }}>
                  <SmartToy sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Commencez une conversation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {type === 'admin' 
                      ? 'Posez des questions sur vos données ou demandez des analyses'
                      : 'Posez vos questions ou demandez de l\'aide'
                    }
                  </Typography>
                </Box>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <MessageBubble
                      key={index}
                      message={msg}
                      isOwn={msg.role === 'user'}
                      onCopyMessage={handleCopyMessage}
                    />
                  ))}
                  {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        L'assistant réfléchit...
                      </Typography>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}

              {/* Error Alert */}
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 2 }}
                  action={
                    <IconButton size="small" onClick={() => setError(null)}>
                      <Close fontSize="small" />
                    </IconButton>
                  }
                >
                  {error}
                </Alert>
              )}
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  ref={inputRef}
                  fullWidth
                  multiline
                  maxRows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    type === 'admin' 
                      ? 'Posez votre question sur les données...'
                      : 'Comment puis-je vous aider ?'
                  }
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={sendMessage}
                  disabled={!message.trim() || loading}
                  sx={{
                    borderRadius: 2,
                    minWidth: 'auto',
                    px: 2
                  }}
                >
                  {loading ? <CircularProgress size={20} /> : <Send />}
                </Button>
              </Box>

              {/* Escalation Button */}
              {type === 'entreprise' && canEscalate && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<Support />}
                    onClick={() => setShowEscalationDialog(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    Escalader vers un administrateur
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Escalation Dialog */}
      <EscalationDialog
        open={showEscalationDialog}
        onClose={() => setShowEscalationDialog(false)}
        onConfirm={handleEscalate}
        conversationId={currentConversationId || ''}
        loading={loading}
      />
    </>
  );
};

export default AIChatModal;
