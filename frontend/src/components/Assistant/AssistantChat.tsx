/**
 * AssistantChat - Interface conversationnelle moderne
 * Composant principal pour les conversations avec l'assistant IA
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Fade,
  Zoom,
  Tooltip,
  Divider,
  LinearProgress,
  Alert,
  Stack,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import {
  Send as SendIcon,
  ContentCopy as CopyIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  MoreVert as MoreIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useOptimizedAssistant } from '../../hooks/useOptimizedAssistant';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  confidence?: number;
  approach?: string;
  metadata?: any;
}

interface AssistantChatProps {
  userRole: 'admin' | 'enterprise';
  enterpriseId?: string;
  userId?: string;
  onClose?: () => void;
  initialMessage?: string;
  showAdvancedFeatures?: boolean;
}

const AssistantChat: React.FC<AssistantChatProps> = ({
  userRole,
  enterpriseId,
  userId,
  onClose,
  initialMessage,
  showAdvancedFeatures
}) => {
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const {
    messages,
    isTyping,
    isInitialized,
    suggestions,
    serviceHealth,
    totalQuestions,
    averageResponseTime,
    successRate,
    askQuestion,
    clearHistory,
    reloadKnowledge,
    canReload,
    isHealthy,
    metrics
  } = useOptimizedAssistant();

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus sur l'input au montage
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Gestion du message initial
  useEffect(() => {
    if (initialMessage && isInitialized) {
      handleSendMessage();
    }
  }, [initialMessage, isInitialized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const question = inputValue.trim();
    setInputValue('');
    
    await askQuestion(question);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInputValue(suggestion);
    await askQuestion(suggestion);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    // TODO: Implémenter le système de feedback
    console.log(`Feedback ${isPositive ? 'positive' : 'negative'} pour message ${messageId}`);
  };

  const handleMessageMenu = (event: React.MouseEvent<HTMLElement>, message: Message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <AssessmentIcon />;
      case 'enterprise':
        return <TrendingUpIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin':
        return theme.palette.error.main;
      case 'enterprise':
        return theme.palette.primary.main;
      default:
        return theme.palette.grey[600];
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return theme.palette.grey[500];
    if (confidence >= 0.8) return theme.palette.success.main;
    if (confidence >= 0.6) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getApproachIcon = (approach?: string) => {
    switch (approach) {
      case 'rules':
        return <LightbulbIcon fontSize="small" />;
      case 'embeddings':
        return <BotIcon fontSize="small" />;
      case 'instant':
        return <TrendingUpIcon fontSize="small" />;
      default:
        return <BotIcon fontSize="small" />;
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default
      }}
    >
      {/* Header avec informations de service */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 0,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(getRoleColor(), 0.1)} 0%, ${alpha(getRoleColor(), 0.05)} 100%)`
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: getRoleColor(),
              width: 40,
              height: 40
            }}
          >
            {getRoleIcon()}
          </Avatar>
          
          <Box flex={1}>
            <Typography variant="h6" component="div">
              Assistant {userRole === 'admin' ? 'Administrateur' : 'Entreprise'}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                icon={isHealthy ? <TrendingUpIcon /> : <AssessmentIcon />}
                label={isHealthy ? 'Service actif' : 'Service dégradé'}
                color={isHealthy ? 'success' : 'warning'}
                size="small"
              />
              {totalQuestions > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {totalQuestions} questions • {averageResponseTime}ms • {successRate}% succès
                </Typography>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            {canReload && (
              <Tooltip title="Recharger la base de connaissances">
                <IconButton
                  size="small"
                  onClick={reloadKnowledge}
                  disabled={!canReload}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Paramètres">
              <IconButton size="small">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            {onClose && (
              <Tooltip title="Fermer">
                <IconButton size="small" onClick={onClose}>
                  <MoreIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {/* Barre de progression pour l'initialisation */}
        {!isInitialized && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Initialisation de l'assistant en cours...
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Zone de messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {messages.length === 0 && isInitialized && (
          <Fade in={true}>
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: 'text.secondary'
              }}
            >
              <BotIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                Bonjour ! Je suis votre assistant IA
              </Typography>
              <Typography variant="body2">
                Posez-moi une question ou choisissez une suggestion ci-dessous
              </Typography>
            </Box>
          </Fade>
        )}

        {messages.map((message, index) => (
          <Fade key={message.id} in={true} timeout={300}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Box
                sx={{
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: message.isUser ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 1
                }}
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    bgcolor: message.isUser ? theme.palette.primary.main : getRoleColor(),
                    width: 32,
                    height: 32,
                    mt: 0.5
                  }}
                >
                  {message.isUser ? <PersonIcon /> : getRoleIcon()}
                </Avatar>

                {/* Message */}
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: message.isUser
                      ? theme.palette.primary.main
                      : theme.palette.background.paper,
                    color: message.isUser
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                    position: 'relative',
                    '&:hover': {
                      '& .message-actions': {
                        opacity: 1
                      }
                    }
                  }}
                >
                  {/* Contenu du message */}
                  <Box sx={{ mb: 1 }}>
                    {message.isUser ? (
                      <Typography variant="body1">{message.content}</Typography>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <Typography variant="body1" paragraph>
                              {children}
                            </Typography>
                          ),
                          code: ({ children }) => (
                            <Box
                              component="code"
                              sx={{
                                backgroundColor: alpha(theme.palette.text.primary, 0.1),
                                padding: '2px 4px',
                                borderRadius: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.875em'
                              }}
                            >
                              {children}
                            </Box>
                          ),
                          pre: ({ children }) => (
                            <Box
                              component="pre"
                              sx={{
                                backgroundColor: alpha(theme.palette.text.primary, 0.05),
                                padding: 2,
                                borderRadius: 1,
                                overflow: 'auto',
                                fontFamily: 'monospace',
                                fontSize: '0.875em'
                              }}
                            >
                              {children}
                            </Box>
                          )
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </Box>

                  {/* Métadonnées du message */}
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ opacity: 0.7 }}
                  >
                    <Typography variant="caption">
                      {formatTimestamp(message.timestamp)}
                    </Typography>
                    
                    {message.confidence && (
                      <Chip
                        label={`${Math.round(message.confidence * 100)}%`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          backgroundColor: alpha(getConfidenceColor(message.confidence), 0.2),
                          color: getConfidenceColor(message.confidence)
                        }}
                      />
                    )}
                    
                    {message.approach && (
                      <Tooltip title={`Approche: ${message.approach}`}>
                        <Chip
                          icon={getApproachIcon(message.approach)}
                          label={message.approach}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.75rem' }}
                        />
                      </Tooltip>
                    )}
                  </Stack>

                  {/* Actions du message */}
                  <Box
                    className="message-actions"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      opacity: 0,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => handleMessageMenu(e, message)}
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: 1,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover
                        }
                      }}
                    >
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Fade>
        ))}

        {/* Indicateur de frappe */}
        {isTyping && (
          <Zoom in={true}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 2,
                maxWidth: 'fit-content'
              }}
            >
              <Avatar sx={{ width: 24, height: 24, bgcolor: getRoleColor() }}>
                <BotIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                L'assistant réfléchit...
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  '& > div': {
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.main,
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '&:nth-of-type(2)': {
                      animationDelay: '0.2s'
                    },
                    '&:nth-of-type(3)': {
                      animationDelay: '0.4s'
                    }
                  },
                  '@keyframes pulse': {
                    '0%, 80%, 100%': {
                      opacity: 0.3
                    },
                    '40%': {
                      opacity: 1
                    }
                  }
                }}
              >
                <div />
                <div />
                <div />
              </Box>
            </Box>
          </Zoom>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            Suggestions
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                variant="outlined"
                size="small"
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Zone de saisie */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 0,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question..."
            disabled={isTyping || !isInitialized}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping || !isInitialized}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                bgcolor: theme.palette.primary.dark
              },
              '&:disabled': {
                bgcolor: theme.palette.action.disabledBackground
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>

        {/* Actions rapides */}
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            size="small"
            startIcon={<HistoryIcon />}
            onClick={clearHistory}
            disabled={messages.length === 0}
          >
            Effacer l'historique
          </Button>
          
          {canReload && (
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={reloadKnowledge}
              disabled={!canReload}
            >
              Recharger les connaissances
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Menu contextuel des messages */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedMessage) {
            handleCopyMessage(selectedMessage.content);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copier</ListItemText>
        </MenuItem>
        
        {selectedMessage && !selectedMessage.isUser && (
          <>
            <MenuItem onClick={() => {
              if (selectedMessage) {
                handleFeedback(selectedMessage.id, true);
              }
              handleMenuClose();
            }}>
              <ListItemIcon>
                <ThumbUpIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Utile</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => {
              if (selectedMessage) {
                handleFeedback(selectedMessage.id, false);
              }
              handleMenuClose();
            }}>
              <ListItemIcon>
                <ThumbDownIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Pas utile</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default AssistantChat;
