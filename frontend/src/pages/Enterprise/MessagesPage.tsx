import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  useTheme,
  alpha,
  Button,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Autocomplete,
  Chip
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Forum,
  Send,
  Search,
  Refresh,
  ChatBubble,
  AttachFile,
  DoneAll,
  AdminPanelSettings,
  Person,
  Close
} from '@mui/icons-material';
import chatService, { ChatMessage } from '../../services/chatService';
import { getAdminUsers } from '../../services/userService';
import type { User } from '../../types/user.types';
import { useAuth } from '../../hooks/useAuth';

interface ConversationGroup {
  adminId: string;
  admin: User | null;
  messages: ChatMessage[];
  unreadCount: number;
  lastMessage: ChatMessage | null;
}

const MessagesPage: React.FC = () => {
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // États
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ConversationGroup[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [newChatDialog, setNewChatDialog] = useState(false);
  const [selectedAdminForNew, setSelectedAdminForNew] = useState('');
  const [stats, setStats] = useState({ total: 0, unread: 0, conversations: 0 });

  useEffect(() => {
    if (user?.entrepriseId) {
      loadData();
      loadAdminUsers();
    }
  }, [user]);

  // Auto-refresh toutes les 5 secondes
  useEffect(() => {
    if (!autoRefresh || !user?.entrepriseId) return;
    
    const interval = setInterval(() => {
      if (selectedConversation) {
        loadMessages(selectedConversation, true);
      } else {
        loadData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, user, selectedConversation]);

  // Scroll vers le bas quand nouveaux messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await loadAllMessages();
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const admins = await getAdminUsers();
      setAdminUsers(admins);
    } catch (err) {
      console.error('Error loading admin users:', err);
    }
  };

  const loadAllMessages = async () => {
    if (!user?.entrepriseId) return;
    
    try {
      const msgs = await chatService.getMessagesByEntreprise(user.entrepriseId);
      setAllMessages(msgs);
      
      // Grouper les messages par admin (recipient ou sender)
      const groupedConversations = groupMessagesByAdmin(msgs);
      setConversations(groupedConversations);
      
      // Calculer stats
      const unread = msgs.filter(m => !m.read && isMessageFromAdmin(m)).length;
      
      setStats({
        total: msgs.length,
        unread,
        conversations: groupedConversations.length
      });
      
      // Marquer comme lus
      await chatService.markConversationAsRead(user.entrepriseId);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des messages');
    }
  };

  const groupMessagesByAdmin = (msgs: ChatMessage[]): ConversationGroup[] => {
    const groups: { [key: string]: ConversationGroup } = {};
    
    msgs.forEach(msg => {
      // Déterminer l'ID de l'admin de cette conversation
      let adminId: string | null = null;
      
      if (isMessageFromAdmin(msg)) {
        adminId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
      } else if (msg.recipient) {
        adminId = typeof msg.recipient === 'object' ? msg.recipient._id : msg.recipient;
      }
      
      if (!adminId) return;
      
      if (!groups[adminId]) {
        groups[adminId] = {
          adminId,
          admin: null, // Sera rempli plus tard
          messages: [],
          unreadCount: 0,
          lastMessage: null
        };
      }
      
      groups[adminId].messages.push(msg);
      
      if (!msg.read && isMessageFromAdmin(msg)) {
        groups[adminId].unreadCount++;
      }
    });
    
    // Trier les messages et définir lastMessage
    const conversationList = Object.values(groups).map(group => {
      group.messages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      group.lastMessage = group.messages[group.messages.length - 1] || null;
      return group;
    });
    
    // Trier par dernier message
    conversationList.sort((a, b) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return conversationList;
  };

  const isMessageFromAdmin = (msg: ChatMessage): boolean => {
    if (typeof msg.sender === 'object') {
      return msg.sender.role === 'admin' || msg.sender.role === 'super_admin';
    }
    return false;
  };

  const loadMessages = async (adminId: string, silent = false) => {
    const conversation = conversations.find(c => c.adminId === adminId);
    if (conversation) {
      setMessages(conversation.messages);
    }
  };

  const handleSelectConversation = async (adminId: string) => {
    setSelectedConversation(adminId);
    await loadMessages(adminId);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !user?.entrepriseId || !selectedConversation) return;

    try {
      setSending(true);
      await chatService.sendMessage({
        entrepriseId: user.entrepriseId,
        recipientId: selectedConversation,
        content: messageInput.trim()
      });

      setMessageInput('');
      await loadAllMessages();
      
      // Recharger la conversation sélectionnée
      await loadMessages(selectedConversation);
      
      setSnackbar({
        open: true,
        message: 'Message envoyé avec succès',
        severity: 'success'
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erreur lors de l\'envoi',
        severity: 'error'
      });
    } finally {
      setSending(false);
    }
  };

  const handleStartNewChat = async () => {
    if (!selectedAdminForNew || !user?.entrepriseId) return;

    try {
      setSending(true);
      
      const selectedAdmin = adminUsers.find(a => a.id === selectedAdminForNew);
      const adminName = selectedAdmin ? `${selectedAdmin.prenom} ${selectedAdmin.nom}` : 'Administrateur';
      
      await chatService.sendMessage({
        entrepriseId: user.entrepriseId,
        recipientId: selectedAdminForNew,
        content: `Bonjour ${adminName}, je souhaite démarrer une conversation avec vous.`
      });

      setNewChatDialog(false);
      setSelectedAdminForNew('');
      
      await loadAllMessages();
      
      // Sélectionner automatiquement la nouvelle conversation
      setSelectedConversation(selectedAdminForNew);
      await loadMessages(selectedAdminForNew);
      
      setSnackbar({
        open: true,
        message: 'Conversation démarrée avec succès',
        severity: 'success'
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erreur lors de la création de la conversation',
        severity: 'error'
      });
    } finally {
      setSending(false);
    }
  };

  const getUserName = (userObj: any) => {
    if (!userObj) return 'Administrateur';
    if (typeof userObj === 'string') return 'Administrateur';
    return `${userObj.prenom || ''} ${userObj.nom || ''}`.trim() || userObj.email || 'Administrateur';
  };

  const getAdminFromConversation = (conversation: ConversationGroup): string => {
    if (!conversation || !conversation.messages || conversation.messages.length === 0) {
      return 'Administrateur';
    }
    
    const firstMessage = conversation.messages[0];
    if (!firstMessage) return 'Administrateur';
    
    if (isMessageFromAdmin(firstMessage)) {
      return getUserName(firstMessage.sender);
    } else if (firstMessage.recipient) {
      return getUserName(firstMessage.recipient);
    }
    
    return 'Administrateur';
  };

  const isMyMessage = (msg: ChatMessage) => {
    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
    return senderId === user?.id;
  };

  const filteredConversations = conversations.filter(conv =>
    getAdminFromConversation(conv).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConvData = conversations.find(c => c.adminId === selectedConversation);

  if (loading && conversations.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, height: 'calc(100vh - 100px)' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="start">
          <Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              gutterBottom
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              💬 Messages
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Communication avec les administrateurs
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Tooltip title={autoRefresh ? "Désactiver rafraîchissement auto" : "Activer rafraîchissement auto"}>
              <IconButton
                onClick={() => setAutoRefresh(!autoRefresh)}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, autoRefresh ? 0.2 : 0.05),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.3) }
                }}
              >
                <Refresh color={autoRefresh ? 'primary' : 'action'} />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<ChatBubble />}
              onClick={() => setNewChatDialog(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              }}
            >
              Nouveau Chat
            </Button>
          </Stack>
        </Stack>

        {/* Stats rapides */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Total Messages</Typography>
              <Typography variant="h5" fontWeight={700} color="primary.main">{stats.total}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Non Lus</Typography>
              <Typography variant="h5" fontWeight={700} color="warning.main">{stats.unread}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Conversations</Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">{stats.conversations}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Layout Chat - Style Slack/Teams */}
      <Paper
        sx={{
          height: 'calc(100% - 200px)',
          borderRadius: 3,
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider'
        }}
      >
        <Grid container sx={{ height: '100%' }}>
          {/* Sidebar - Liste des conversations */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              borderRight: 1,
              borderColor: 'divider',
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <Stack sx={{ height: '100%' }}>
              {/* Recherche conversations */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Rechercher une conversation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
              </Box>

              {/* Liste des conversations */}
              <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                {filteredConversations.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucune conversation
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ChatBubble />}
                      onClick={() => setNewChatDialog(true)}
                      sx={{ mt: 2 }}
                    >
                      Démarrer une conversation
                    </Button>
                  </Box>
                ) : (
                  filteredConversations.map((conv) => (
                    <ListItemButton
                      key={conv.adminId}
                      selected={selectedConversation === conv.adminId}
                      onClick={() => handleSelectConversation(conv.adminId)}
                      sx={{
                        borderLeft: 3,
                        borderColor: selectedConversation === conv.adminId ? 'primary.main' : 'transparent',
                        bgcolor: selectedConversation === conv.adminId ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05)
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Badge badgeContent={conv.unreadCount} color="error">
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            <AdminPanelSettings />
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {getAdminFromConversation(conv)}
                          </Typography>
                        }
                        secondary={
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {conv.lastMessage?.content || 'Pas de message'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {conv.lastMessage?.createdAt 
                                ? new Date(conv.lastMessage.createdAt).toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : ''}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItemButton>
                  ))
                )}
              </List>
            </Stack>
          </Grid>

          {/* Zone de Chat */}
          <Grid item xs={12} md={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {!selectedConversation ? (
              // Pas de conversation sélectionnée
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  p: 4
                }}
              >
                <ChatBubble sx={{ fontSize: 80, color: theme.palette.grey[300], mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Sélectionnez une conversation
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Choisissez un administrateur dans la liste de gauche
                  <br />
                  ou créez un nouveau chat
                </Typography>
              </Box>
            ) : (
              <>
                {/* Header de la conversation */}
                <Paper
                  sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    borderRadius: 0
                  }}
                  elevation={0}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <AdminPanelSettings />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {selectedConvData ? getAdminFromConversation(selectedConvData) : 'Administrateur'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {messages.length} message(s)
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Actualiser">
                        <IconButton
                          size="small"
                          onClick={() => loadAllMessages()}
                        >
                          <Refresh fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Paper>

                {/* Zone des messages */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 3,
                    bgcolor: alpha(theme.palette.grey[500], 0.02)
                  }}
                >
                  {messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Aucun message dans cette conversation
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Envoyez le premier message ci-dessous
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {messages.map((msg, index) => {
                        const isMine = isMyMessage(msg);
                        const showDate = index === 0 || 
                          new Date(messages[index - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                        return (
                          <Box key={msg._id}>
                            {showDate && (
                              <Box sx={{ textAlign: 'center', my: 2 }}>
                                <Chip
                                  label={new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                  size="small"
                                  sx={{ bgcolor: alpha(theme.palette.grey[500], 0.1) }}
                                />
                              </Box>
                            )}
                            
                            <Stack
                              direction="row"
                              spacing={1.5}
                              justifyContent={isMine ? 'flex-end' : 'flex-start'}
                            >
                              {!isMine && (
                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main' }}>
                                  <AdminPanelSettings fontSize="small" />
                                </Avatar>
                              )}
                              
                              <Paper
                                sx={{
                                  p: 2,
                                  maxWidth: '70%',
                                  borderRadius: 2,
                                  bgcolor: isMine 
                                    ? theme.palette.primary.main 
                                    : theme.palette.grey[100],
                                  color: isMine ? 'white' : 'text.primary'
                                }}
                              >
                                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}>
                                  {isMine ? 'Vous' : getUserName(msg.sender)}
                                </Typography>
                                <Typography variant="body2">
                                  {msg.content}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ opacity: 0.7, display: 'block', mt: 0.5, textAlign: 'right' }}
                                >
                                  {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                  {msg.read && isMine && ' • Lu'}
                                </Typography>
                              </Paper>

                              {isMine && (
                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                  <Person fontSize="small" />
                                </Avatar>
                              )}
                            </Stack>
                          </Box>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </Stack>
                  )}
                </Box>

                {/* Zone de saisie */}
                <Paper
                  sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    borderRadius: 0
                  }}
                  elevation={0}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton size="small" disabled>
                      <AttachFile fontSize="small" />
                    </IconButton>
                    <TextField
                      fullWidth
                      placeholder="Écrivez votre message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      multiline
                      maxRows={4}
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sending}
                      sx={{
                        borderRadius: 3,
                        minWidth: 100,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                      }}
                      endIcon={sending ? <CircularProgress size={16} color="inherit" /> : <Send />}
                    >
                      {sending ? 'Envoi...' : 'Envoyer'}
                    </Button>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Appuyez sur Entrée pour envoyer • Maj+Entrée pour nouvelle ligne
                  </Typography>
                </Paper>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog Nouveau Chat */}
      <Dialog
        open={newChatDialog}
        onClose={() => setNewChatDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              Nouveau Chat
            </Typography>
            <IconButton size="small" onClick={() => setNewChatDialog(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Autocomplete
              options={adminUsers.filter(admin => !conversations.find(c => c.adminId === admin.id))}
              getOptionLabel={(option) => `${option.prenom} ${option.nom} - ${option.email}`}
              value={adminUsers.find(a => a.id === selectedAdminForNew) || null}
              onChange={(event, value) => setSelectedAdminForNew(value ? value.id : '')}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      <AdminPanelSettings fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {option.prenom} {option.nom}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.email} • {option.role}
                      </Typography>
                    </Box>
                  </Stack>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sélectionner un administrateur"
                  placeholder="Rechercher par nom..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Sélectionnez un administrateur pour démarrer une nouvelle conversation
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChatDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleStartNewChat}
            disabled={!selectedAdminForNew || sending}
            startIcon={sending ? <CircularProgress size={20} /> : <ChatBubble />}
          >
            {sending ? 'Démarrage...' : 'Démarrer le Chat'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MessagesPage;
