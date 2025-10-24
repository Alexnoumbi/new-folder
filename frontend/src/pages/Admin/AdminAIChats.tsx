import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  useTheme,
  alpha,
  Chip,
  IconButton,
  Tooltip,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  Alert,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
import {
  SmartToy,
  TrendingUp,
  Support,
  Chat,
  Business,
  Person,
  FilterList,
  Search,
  Download,
  Refresh,
  Visibility,
  Delete,
  AccessTime,
  Analytics
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useAIStats } from '../../hooks/useAIChat';
import { AIConversationSummary } from '../../types/aiChat.types';
import { aiChatService } from '../../services/aiChatService';
import AIChatModal from '../../components/AI/AIChatModal';

const AdminAIChats: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { stats, health, loading: statsLoading, refreshStats, refreshHealth } = useAIStats();
  
  const [conversations, setConversations] = useState<AIConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiChatService.getConversations(1, 100);
      setConversations(response.data.conversations);
    } catch (error: any) {
      setError(error.message || 'Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchTerm || 
      conv.userId.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'escalated' && conv.metadata.escalated) ||
      (statusFilter === 'active' && conv.isActive) ||
      (statusFilter === 'resolved' && conv.metadata.resolved);
    
    const matchesRole = roleFilter === 'all' || conv.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusColor = (conversation: AIConversationSummary) => {
    if (conversation.metadata.escalated) return 'warning';
    if (conversation.metadata.resolved) return 'success';
    if (conversation.isActive) return 'info';
    return 'default';
  };

  const getStatusLabel = (conversation: AIConversationSummary) => {
    if (conversation.metadata.escalated) return 'Escaladé';
    if (conversation.metadata.resolved) return 'Résolu';
    if (conversation.isActive) return 'Actif';
    return 'Inactif';
  };

  const formatLastActivity = (date: Date | string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  const handleViewConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowChatModal(true);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      try {
        await aiChatService.deleteConversation(conversationId);
        setConversations(prev => prev.filter(conv => conv._id !== conversationId));
      } catch (error: any) {
        setError(error.message || 'Erreur lors de la suppression');
      }
    }
  };

  const exportConversations = () => {
    const csvContent = [
      ['Utilisateur', 'Email', 'Type', 'Dernier Message', 'Messages', 'Statut', 'Dernière Activité'].join(','),
      ...filteredConversations.map(conv => [
        conv.userId.nom,
        conv.userId.email,
        conv.role,
        `"${conv.lastMessage.replace(/"/g, '""')}"`,
        conv.messageCount,
        getStatusLabel(conv),
        formatLastActivity(conv.lastActivity)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversations-ia-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
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
              Gestion des Conversations IA
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Surveillez et gérez toutes les interactions avec les assistants IA
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportConversations}
              disabled={filteredConversations.length === 0}
            >
              Exporter
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                loadConversations();
                refreshStats();
                refreshHealth();
              }}
            >
              Actualiser
            </Button>
            <Button
              variant="contained"
              startIcon={<SmartToy />}
              onClick={() => setShowChatModal(true)}
            >
              Nouvelle Conversation
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {stats.totalConversations}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Conversations
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <Chat />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="secondary.main">
                      {stats.enterpriseConversations}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Conversations Entreprise
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                    <Business />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {stats.escalatedConversations}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Escalades
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                    <Support />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {stats.escalationRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taux d'Escalade
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                    <TrendingUp />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Health Status */}
      {health && (
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" gap={2} mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Statut de l'IA
              </Typography>
              <Chip
                label={health.aiService.configured ? 'Configuré' : 'Non configuré'}
                color={health.aiService.configured ? 'success' : 'warning'}
                size="small"
              />
            </Stack>
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Provider: {health.aiService.provider}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Modèle: {health.aiService.model}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Base de connaissances: {health.knowledgeBase.entries} entrées
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statusFilter}
                  label="Statut"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="escalated">Escaladé</MenuItem>
                  <MenuItem value="resolved">Résolu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={roleFilter}
                  label="Type"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="entreprise">Entreprise</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredConversations.length} conversation{filteredConversations.length > 1 ? 's' : ''}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Conversations Table */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Utilisateur</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Dernier Message</TableCell>
                    <TableCell>Messages</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Dernière Activité</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredConversations.map((conversation) => (
                    <TableRow key={conversation._id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {conversation.role === 'admin' ? <Person /> : <Business />}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {conversation.userId.nom}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {conversation.userId.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={conversation.role}
                          size="small"
                          color={conversation.role === 'admin' ? 'primary' : 'secondary'}
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                          {conversation.lastMessage}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {conversation.messageCount}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={getStatusLabel(conversation)}
                          size="small"
                          color={getStatusColor(conversation) as any}
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="caption">
                            {formatLastActivity(conversation.lastActivity)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Voir la conversation">
                            <IconButton
                              size="small"
                              onClick={() => handleViewConversation(conversation._id)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteConversation(conversation._id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {filteredConversations.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SmartToy sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucune conversation trouvée
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ajustez vos filtres ou attendez que les utilisateurs commencent des conversations
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* AI Chat Modal */}
      <AIChatModal
        type="admin"
        open={showChatModal}
        onClose={() => {
          setShowChatModal(false);
          setSelectedConversation(null);
        }}
        initialConversationId={selectedConversation || undefined}
      />
    </Container>
  );
};

export default AdminAIChats;
