import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
  Button,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Autocomplete
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Forum,
  Send,
  Search,
  Refresh,
  ChatBubble,
  AttachFile,
  MoreVert,
  Delete,
  DoneAll,
  CheckCircle,
  Business,
  Person,
  Close,
  FilterList
} from '@mui/icons-material';
import chatService, { ChatMessage, Conversation } from '../../services/chatService';
import entrepriseService, { Entreprise } from '../../services/entrepriseService';

const AdminDiscussions: React.FC = () => {
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // États
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [newChatDialog, setNewChatDialog] = useState(false);
  const [selectedEntrepriseForNew, setSelectedEntrepriseForNew] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadData();
    loadEntreprises();
  }, []);

  // Auto-refresh toutes les 5 secondes
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      if (selectedConversation) {
        loadMessages(selectedConversation, true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedConversation]);

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
      const [convs, statsData] = await Promise.all([
        chatService.getConversations(),
        chatService.getStats()
      ]);
      setConversations(convs);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadEntreprises = async () => {
    try {
      const list = await entrepriseService.getEntreprises();
      setEntreprises(list);
    } catch (err) {
      console.error('Error loading entreprises:', err);
    }
  };

  const loadMessages = async (entrepriseId: string, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const msgs = await chatService.getMessagesByEntreprise(entrepriseId);
      setMessages(msgs);
      
      // Marquer comme lus
      await chatService.markConversationAsRead(entrepriseId);
      
      // Mettre à jour le unreadCount local
      setConversations(prev => prev.map(conv => 
        conv._id === entrepriseId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (err: any) {
      console.error('Error loading messages:', err);
      if (!silent) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des messages');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSelectConversation = async (entrepriseId: string) => {
    setSelectedConversation(entrepriseId);
    await loadMessages(entrepriseId);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      setSending(true);
      await chatService.sendMessage({
        entrepriseId: selectedConversation,
        content: messageInput.trim()
      });

      setMessageInput('');
      await loadMessages(selectedConversation, true);
      await loadData(); // Rafraîchir les conversations
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

  const handleNewChat = async () => {
    if (!selectedEntrepriseForNew) return;

    try {
      console.log('Creating new chat for entreprise:', selectedEntrepriseForNew);
      
      const entreprise = entreprises.find(e => e._id === selectedEntrepriseForNew);
      const entrepriseName = getEntrepriseNom(entreprise);
      
      await chatService.sendMessage({
        entrepriseId: selectedEntrepriseForNew,
        content: `Début de la conversation avec ${entrepriseName}`
      });

      console.log('New chat created successfully');

      setNewChatDialog(false);
      setSelectedEntrepriseForNew('');
      
      // Recharger les données
      await loadData();
      
      // Sélectionner et ouvrir la nouvelle conversation
      setSelectedConversation(selectedEntrepriseForNew);
      await loadMessages(selectedEntrepriseForNew);
      
      setSnackbar({
        open: true,
        message: 'Conversation créée avec succès',
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Error creating new chat:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || err.response?.data?.message || 'Erreur lors de la création du chat',
        severity: 'error'
      });
    }
  };

  const getEntrepriseNom = (entreprise: any) => {
    if (!entreprise) return 'Entreprise';
    if (typeof entreprise === 'string') return 'Entreprise';
    return entreprise.identification?.nomEntreprise || entreprise.nom || entreprise.name || 'Entreprise';
  };

  const getUserName = (user: any) => {
    if (!user) return 'Utilisateur';
    if (typeof user === 'string') return 'Utilisateur';
    return `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email || 'Utilisateur';
  };

  const filteredConversations = conversations.filter(conv =>
    getEntrepriseNom(conv.entreprise).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && conversations.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  const selectedConvData = conversations.find(c => c._id === selectedConversation);

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
              💬 Discussions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Messagerie avec les entreprises partenaires
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
        {stats && (
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
                <Typography variant="h5" fontWeight={700} color="success.main">{conversations.length}</Typography>
            </Paper>
          </Grid>
        </Grid>
        )}
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
                  </Box>
                ) : (
                  filteredConversations.map((conv) => (
                    <ListItemButton
                      key={conv._id}
                      selected={selectedConversation === conv._id}
                      onClick={() => handleSelectConversation(conv._id)}
              sx={{
                        borderLeft: 3,
                        borderColor: selectedConversation === conv._id ? 'primary.main' : 'transparent',
                        bgcolor: selectedConversation === conv._id ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05)
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Badge badgeContent={conv.unreadCount} color="error">
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Business />
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {getEntrepriseNom(conv.entreprise)}
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
                  Choisissez une entreprise dans la liste de gauche
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
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Business />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {getEntrepriseNom(selectedConvData?.entreprise)}
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
                          onClick={() => loadMessages(selectedConversation)}
                        >
                          <Refresh fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Marquer tout comme lu">
                        <IconButton
                          size="small"
                          onClick={() => chatService.markConversationAsRead(selectedConversation)}
                        >
                          <DoneAll fontSize="small" />
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
                        const isAdmin = typeof msg.sender === 'object' && msg.sender.role === 'admin';
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
                              justifyContent={isAdmin ? 'flex-end' : 'flex-start'}
                            >
                              {!isAdmin && (
                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main' }}>
                                  <Person />
                                </Avatar>
                              )}
                              
                              <Paper
                                sx={{
                                  p: 2,
                                  maxWidth: '70%',
                                  borderRadius: 2,
                                  bgcolor: isAdmin 
                                    ? theme.palette.primary.main 
                                    : theme.palette.grey[100],
                                  color: isAdmin ? 'white' : 'text.primary'
                                }}
                              >
                                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}>
                                  {getUserName(msg.sender)}
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
                                  {msg.read && isAdmin && ' • Lu'}
                    </Typography>
                              </Paper>

                              {isAdmin && (
                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                  <Person />
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
                    <IconButton size="small">
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
              options={entreprises.filter(ent => !conversations.find(c => c._id === ent._id))}
              getOptionLabel={(option) => getEntrepriseNom(option)}
              value={entreprises.find(e => e._id === selectedEntrepriseForNew) || null}
              onChange={(event, value) => setSelectedEntrepriseForNew(value ? value._id : '')}
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Business fontSize="small" />
                    <Box>
                      <Typography variant="body2">
                        {option.identification?.nomEntreprise || option.nom || option.name || 'Sans nom'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.identification?.secteurActivite || 'Secteur non défini'} • {option.identification?.ville || 'Ville'}
                      </Typography>
                    </Box>
        </Stack>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sélectionner une entreprise"
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
              Sélectionnez une entreprise pour démarrer une nouvelle conversation
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChatDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleNewChat}
            disabled={!selectedEntrepriseForNew}
          >
            Démarrer le Chat
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

export default AdminDiscussions;
