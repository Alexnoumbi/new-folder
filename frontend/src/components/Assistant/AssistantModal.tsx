import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  alpha,
  Avatar,
  Tooltip,
  Badge,
  Fade,
  Zoom,
  LinearProgress,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Close,
  Send,
  QuestionAnswer,
  Psychology,
  AutoAwesome,
  Person,
  SmartToy,
  ContentCopy,
  ThumbUp,
  ThumbDown,
  Refresh,
  Settings,
  Analytics,
  Speed,
  CheckCircle,
  Error,
  Warning,
  Info,
  Clear,
  MoreVert
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useOptimizedAssistant, Message } from '../../hooks/useOptimizedAssistant';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AssistantModalProps {
  type: 'admin' | 'entreprise';
  open: boolean;
  onClose: () => void;
}

const AssistantModal: React.FC<AssistantModalProps> = ({
  type,
  open,
  onClose
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  
  // Hook optimisé pour l'assistant
  const {
    messages,
    isTyping,
    isInitialized,
    suggestions,
    suggestionsLoading,
    serviceHealth,
    totalQuestions,
    averageResponseTime,
    successRate,
    askQuestion,
    useSuggestion,
    clearHistory,
    reloadKnowledge,
    canReload,
    isHealthy,
    metrics
  } = useOptimizedAssistant({
    enableSuggestions: true,
    autoHealthCheck: true,
    maxMessages: 100
  });

  const [inputValue, setInputValue] = useState('');
  const [showMetrics, setShowMetrics] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Statut de santé avec couleurs
  const getHealthColor = () => {
    if (!serviceHealth) return theme.palette.grey[500];
    switch (serviceHealth.status) {
      case 'healthy': return theme.palette.success.main;
      case 'unhealthy': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getHealthIcon = () => {
    if (!serviceHealth) return <Info />;
    switch (serviceHealth.status) {
      case 'healthy': return <CheckCircle />;
      case 'unhealthy': return <Warning />;
      case 'error': return <Error />;
      default: return <Info />;
    }
  };

  // Scroll automatique vers le bas avec animation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gestion du menu d'options
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // L'initialisation est maintenant gérée par le hook useOptimizedAssistant

  // Envoi d'une question (utilisation du hook optimisé)
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const question = inputValue.trim();
    setInputValue('');
    
    await askQuestion(question);
  };

  // Sélection d'une question suggérée (utilisation directe)
  const handleSuggestedQuestion = async (question: string) => {
    await askQuestion(question);
  };

  // Copier le contenu d'un message
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Gestion de la touche Entrée
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: '85vh',
          height: '650px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: theme.shadows[24],
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)'
        }
      }}
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      <DialogTitle
        sx={{
          background: type === 'admin'
            ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" flex={1}>
          <Badge 
            color={isHealthy ? 'success' : 'error'}
            variant="dot"
            sx={{
              '& .MuiBadge-dot': {
                animation: isHealthy ? 'pulse 2s infinite' : 'none'
              }
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.common.white, 0.2),
                color: 'white',
                border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`
              }}
            >
              <Psychology />
            </Avatar>
          </Badge>
          
          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" fontWeight="bold">
                Assistant {type === 'admin' ? 'Administration' : 'Entreprise'} ✨
              </Typography>
              
              {serviceHealth && (
                <Tooltip title={`Service: ${serviceHealth.status}`}>
                  <Box sx={{ color: getHealthColor(), display: 'flex', alignItems: 'center' }}>
                    {getHealthIcon()}
                  </Box>
                </Tooltip>
              )}
            </Stack>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                IA optimisée • {totalQuestions} questions • {averageResponseTime}ms moy.
              </Typography>
              
              {successRate > 0 && (
                <Typography variant="caption" sx={{ 
                  opacity: 0.9,
                  color: successRate > 90 ? theme.palette.success.light : theme.palette.warning.light
                }}>
                  {successRate}% de succès
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          {canReload && (
            <Tooltip title="Recharger la base de connaissances">
              <IconButton 
                onClick={() => reloadKnowledge()}
                sx={{ color: 'white' }}
                size="small"
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Options">
            <IconButton 
              onClick={handleMenuClick}
              sx={{ color: 'white' }}
              size="small"
            >
              <MoreVert />
            </IconButton>
          </Tooltip>
          
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Barre de progression pour l'initialisation */}
        {!isInitialized && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress 
              color={type === 'admin' ? 'secondary' : 'primary'} 
              variant="indeterminate"
            />
          </Box>
        )}

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            backgroundColor: alpha(theme.palette.background.default, 0.3),
            backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.02)} 0%, ${alpha(theme.palette.secondary.light, 0.02)} 100%)`
          }}
        >
          <Stack spacing={3}>
            {messages.map((message, index) => (
              <Zoom 
                in={true} 
                key={message.id}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                <Paper
                  elevation={message.type === 'user' ? 8 : 2}
                  sx={{
                    p: 3,
                    maxWidth: message.type === 'system' ? '90%' : '75%',
                    backgroundColor: message.type === 'user'
                      ? (type === 'admin' ? theme.palette.secondary.main : theme.palette.primary.main)
                      : message.type === 'system'
                        ? alpha(theme.palette.info.main, 0.1)
                        : theme.palette.background.paper,
                    color: message.type === 'user' ? 'white' : 
                           message.error ? theme.palette.error.main : 'text.primary',
                    borderRadius: message.type === 'user' 
                      ? '20px 20px 6px 20px'
                      : '20px 20px 20px 6px',
                    position: 'relative',
                    border: message.error ? `1px solid ${theme.palette.error.main}` : 
                            message.type === 'system' ? `1px solid ${alpha(theme.palette.info.main, 0.3)}` : 'none',
                    boxShadow: message.type === 'user' 
                      ? `0 4px 20px ${alpha(type === 'admin' ? theme.palette.secondary.main : theme.palette.primary.main, 0.3)}`
                      : theme.shadows[2],
                    '&:hover': {
                      boxShadow: message.type === 'user' 
                        ? `0 6px 25px ${alpha(type === 'admin' ? theme.palette.secondary.main : theme.palette.primary.main, 0.4)}`
                        : theme.shadows[4],
                      '& .message-actions': {
                        opacity: 1
                      }
                    }
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    {message.type === 'assistant' && (
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: message.error ? theme.palette.error.main : theme.palette.primary.main,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                      }}>
                        <SmartToy sx={{ fontSize: 18 }} />
                      </Avatar>
                    )}
                    
                    {message.type === 'system' && (
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: theme.palette.info.main 
                      }}>
                        <Settings sx={{ fontSize: 18 }} />
                      </Avatar>
                    )}
                    
                    <Box flex={1}>
                      {message.isLoading ? (
                        <Stack direction="row" spacing={2} alignItems="center">
                          <CircularProgress size={20} color={type === 'admin' ? 'secondary' : 'primary'} />
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                            Génération de la réponse...
                          </Typography>
                        </Stack>
                      ) : (
                        <>
                          <Box sx={{ 
                            '& p': { margin: 0, marginBottom: 1 },
                            '& ul, & ol': { paddingLeft: 2, marginBottom: 1 },
                            '& li': { marginBottom: 0.5 },
                            '& code': { 
                              backgroundColor: alpha(theme.palette.grey[500], 0.1),
                              padding: '2px 4px',
                              borderRadius: 1,
                              fontFamily: 'monospace'
                            },
                            '& pre': {
                              backgroundColor: alpha(theme.palette.grey[500], 0.1),
                              padding: 2,
                              borderRadius: 1,
                              overflow: 'auto'
                            },
                            '& strong': { fontWeight: 600 },
                            '& em': { fontStyle: 'italic' }
                          }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </Box>
                          
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {message.timestamp.toLocaleTimeString()}
                            </Typography>
                            
                            {message.approach && (
                              <Chip 
                                label={message.approach}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.7rem',
                                  opacity: 0.7
                                }}
                              />
                            )}
                            
                            {message.confidence && (
                              <Chip 
                                label={`${Math.round(message.confidence * 100)}%`}
                                size="small"
                                color={message.confidence > 0.8 ? 'success' : 'warning'}
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.7rem',
                                  opacity: 0.8
                                }}
                              />
                            )}
                            
                            {message.responseTime && (
                              <Chip 
                                icon={<Speed sx={{ fontSize: 12 }} />}
                                label={`${message.responseTime}ms`}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.7rem',
                                  opacity: 0.7
                                }}
                              />
                            )}
                          </Stack>
                        </>
                      )}
                    </Box>
                    
                    {message.type === 'user' && (
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: alpha(theme.palette.common.white, 0.9),
                        color: theme.palette.text.primary,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                      }}>
                        <Person sx={{ fontSize: 18 }} />
                      </Avatar>
                    )}
                  </Stack>

                  {/* Actions sur les messages */}
                  {!message.isLoading && (
                    <Box
                      className="message-actions"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: message.type === 'user' ? 'auto' : 8,
                        left: message.type === 'user' ? 8 : 'auto',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        display: 'flex',
                        gap: 0.5
                      }}
                    >
                      <Tooltip title="Copier">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyMessage(message.content)}
                          sx={{
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: theme.shadows[2],
                            width: 24,
                            height: 24
                          }}
                        >
                          <ContentCopy sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Paper>
                </Box>
              </Zoom>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>

        {/* Questions suggérées */}
        {messages.length <= 1 && suggestions.length > 0 && (
          <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', backgroundColor: alpha(theme.palette.background.paper, 0.7) }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <AutoAwesome sx={{ color: theme.palette.primary.main }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Suggestions personnalisées
              </Typography>
            </Stack>
            
            {suggestionsLoading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Chargement des suggestions...
                </Typography>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {suggestions.slice(0, 6).map((question, index) => (
                  <Zoom in={true} key={index} style={{ transitionDelay: `${index * 100}ms` }}>
                    <Chip
                      label={question}
                      variant="outlined"
                      clickable
                      onClick={() => handleSuggestedQuestion(question)}
                      sx={{
                        mb: 1,
                        borderRadius: 3,
                        '&:hover': {
                          backgroundColor: alpha(
                            type === 'admin' ? theme.palette.secondary.main : theme.palette.primary.main,
                            0.1
                          ),
                          borderColor: type === 'admin' ? theme.palette.secondary.main : theme.palette.primary.main,
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[4]
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    />
                  </Zoom>
                ))}
              </Stack>
            )}
          </Box>
        )}

        {/* Zone de saisie améliorée */}
        <Box sx={{ 
          p: 3, 
          borderTop: 1, 
          borderColor: 'divider',
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(10px)'
        }}>
          <Stack direction="row" spacing={2} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isInitialized ? "Posez votre question ici... 💭" : "Initialisation en cours..."}
              disabled={isTyping || !isInitialized}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: type === 'admin' ? theme.palette.secondary.main : theme.palette.primary.main,
                      borderWidth: 2
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: type === 'admin' ? theme.palette.secondary.main : theme.palette.primary.main,
                      borderWidth: 2
                    }
                  }
                }
              }}
            />
            
            <Tooltip title={isInitialized ? "Envoyer la question" : "Initialisation en cours..."}>
              <span>
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || !isInitialized}
                  sx={{
                    backgroundColor: type === 'admin' ? theme.palette.secondary.main : theme.palette.primary.main,
                    color: 'white',
                    width: 56,
                    height: 56,
                    boxShadow: theme.shadows[8],
                    '&:hover': {
                      backgroundColor: type === 'admin' ? theme.palette.secondary.dark : theme.palette.primary.dark,
                      transform: 'translateY(-2px) scale(1.05)',
                      boxShadow: theme.shadows[12]
                    },
                    '&:active': {
                      transform: 'translateY(0px) scale(1.02)'
                    },
                    '&:disabled': {
                      backgroundColor: theme.palette.grey[300],
                      color: theme.palette.grey[500],
                      transform: 'none',
                      boxShadow: theme.shadows[2]
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {isTyping ? 
                    <CircularProgress size={24} color="inherit" /> : 
                    <Send sx={{ fontSize: 24 }} />
                  }
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
          
          {/* Indicateur de statut */}
          {isInitialized && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, opacity: 0.7 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: isHealthy ? theme.palette.success.main : theme.palette.error.main,
                animation: isHealthy ? 'pulse 2s infinite' : 'none'
              }} />
              <Typography variant="caption" color="text.secondary">
                {isHealthy ? 'Assistant prêt' : 'Service dégradé'} • 
                {totalQuestions} questions • {averageResponseTime}ms moy.
              </Typography>
            </Stack>
          )}
        </Box>
      </DialogContent>

      {/* Menu d'options */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          setShowMetrics(!showMetrics);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Analytics />
          </ListItemIcon>
          <ListItemText primary={showMetrics ? "Masquer métriques" : "Voir métriques"} />
        </MenuItem>
        
        <MenuItem onClick={() => {
          clearHistory();
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Clear />
          </ListItemIcon>
          <ListItemText primary="Effacer l'historique" />
        </MenuItem>
        
        {canReload && (
          <MenuItem onClick={() => {
            reloadKnowledge();
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Refresh />
            </ListItemIcon>
            <ListItemText primary="Recharger la base" />
          </MenuItem>
        )}
      </Menu>

      {/* Dialog des métriques */}
      {showMetrics && (
        <Dialog
          open={showMetrics}
          onClose={() => setShowMetrics(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Métriques de Performance</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2">Questions traitées</Typography>
                <Typography variant="h4">{totalQuestions}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2">Temps de réponse moyen</Typography>
                <Typography variant="h4">{averageResponseTime}ms</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2">Taux de succès</Typography>
                <Typography variant="h4">{successRate}%</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2">Cache</Typography>
                <Typography>{metrics.cacheStats.size} entrées</Typography>
              </Box>
              
              {serviceHealth && (
                <Box>
                  <Typography variant="subtitle2">Statut du service</Typography>
                  <Chip 
                    label={serviceHealth.status}
                    color={isHealthy ? 'success' : 'error'}
                    icon={getHealthIcon()}
                  />
                </Box>
              )}
            </Stack>
            
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button onClick={() => setShowMetrics(false)}>
                Fermer
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default AssistantModal;
