import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  useTheme,
  alpha,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  Support,
  SmartToy,
  Chat,
  Business,
  AccessTime,
  CheckCircle,
  Warning,
  Refresh,
  Add,
  Help,
  QuestionAnswer
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useAIChat } from '../../hooks/useAIChat';
import { AIConversationSummary } from '../../types/aiChat.types';
import AIChatModal from '../../components/AI/AIChatModal';
import ConversationList from '../../components/AI/ConversationList';

const EnterpriseAISupport: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const {
    conversations,
    loading,
    error,
    loadConversations,
    clearError
  } = useAIChat('entreprise');
  
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const activeConversations = conversations.filter(conv => conv.isActive);
  const escalatedConversations = conversations.filter(conv => conv.metadata.escalated);
  const recentConversations = conversations.slice(0, 5);

  const formatLastActivity = (date: Date | string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  const handleStartNewConversation = () => {
    setSelectedConversationId(null);
    setShowChatModal(true);
  };

  const handleViewConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowChatModal(true);
  };

  const getEscalationStatus = (conversation: AIConversationSummary) => {
    if (!conversation.metadata.escalationId) return null;
    
    // Vous pourriez récupérer le statut depuis l'API des SubmissionRequests
    // Pour l'instant, on simule
    return 'En cours de traitement';
  };

  const faqItems = [
    {
      question: "Comment créer un nouveau KPI ?",
      answer: "Allez dans la section KPI de votre tableau de bord et cliquez sur 'Nouveau KPI'."
    },
    {
      question: "Comment soumettre un rapport ?",
      answer: "Utilisez la section Rapports et suivez le processus de soumission guidé."
    },
    {
      question: "Comment planifier une visite ?",
      answer: "Les visites sont planifiées par les administrateurs. Consultez votre calendrier."
    },
    {
      question: "Que faire en cas de problème technique ?",
      answer: "Utilisez l'assistant IA ou escaladez vers un administrateur."
    }
  ];

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
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Support IA
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Obtenez de l'aide instantanée avec notre assistant IA intelligent
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadConversations}
              disabled={loading}
            >
              Actualiser
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleStartNewConversation}
            >
              Nouvelle Conversation
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {conversations.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conversations Total
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <Chat />
                </Avatar>
              </Stack>
              
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Actives
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {activeConversations.length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Escaladées
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {escalatedConversations.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Actions Rapides
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SmartToy />}
                  onClick={handleStartNewConversation}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Nouvelle Question
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Help />}
                  onClick={() => setShowChatModal(true)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Aide Générale
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<QuestionAnswer />}
                  onClick={() => {
                    // Scroll to FAQ section
                    const faqElement = document.getElementById('faq-section');
                    faqElement?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Voir la FAQ
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Status */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Statut de l'Assistant
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: theme.palette.success.main,
                      animation: 'pulse 2s infinite'
                    }}
                  />
                  <Typography variant="body2">
                    Assistant IA Actif
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                  <Typography variant="body2">
                    Base de connaissances à jour
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Support sx={{ color: 'info.main', fontSize: 20 }} />
                  <Typography variant="body2">
                    Escalade disponible 24/7
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Escalated Conversations */}
        {escalatedConversations.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Demandes Escaladées
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Vos demandes transmises aux administrateurs
                </Typography>
                
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {escalatedConversations.map((conversation) => (
                    <Paper
                      key={conversation._id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: 1,
                        borderColor: alpha(theme.palette.warning.main, 0.3),
                        bgcolor: alpha(theme.palette.warning.main, 0.05)
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Conversation #{conversation._id.slice(-8)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {conversation.lastMessage}
                          </Typography>
                          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime fontSize="small" color="action" />
                              <Typography variant="caption">
                                {formatLastActivity(conversation.lastActivity)}
                              </Typography>
                            </Box>
                            <Chip
                              label="En traitement"
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                        
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewConversation(conversation._id)}
                        >
                          Voir
                        </Button>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Conversations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Conversations Récentes
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Vos dernières interactions avec l'assistant IA
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : recentConversations.length > 0 ? (
                <ConversationList
                  conversations={recentConversations}
                  onSelectConversation={handleViewConversation}
                  onDeleteConversation={() => {}} // Read-only for enterprise
                  loading={false}
                />
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Chat sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Aucune conversation récente
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleStartNewConversation}
                    sx={{ mt: 2 }}
                  >
                    Commencer une conversation
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* FAQ Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }} id="faq-section">
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Questions Fréquentes
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Réponses aux questions les plus courantes
              </Typography>
              
              <Stack spacing={2} sx={{ mt: 2 }}>
                {faqItems.map((item, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                      }
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {item.question}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.answer}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Chat Modal */}
      <AIChatModal
        type="entreprise"
        open={showChatModal}
        onClose={() => {
          setShowChatModal(false);
          setSelectedConversationId(null);
        }}
        initialConversationId={selectedConversationId || undefined}
      />
    </Container>
  );
};

export default EnterpriseAISupport;
