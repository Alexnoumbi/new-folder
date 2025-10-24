import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  useTheme,
  alpha,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Person,
  SmartToy,
  Schedule,
  ContentCopy,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { AIMessage } from '../../types/aiChat.types';

interface MessageBubbleProps {
  message: AIMessage;
  isOwn: boolean;
  showTimestamp?: boolean;
  onCopyMessage?: (content: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showTimestamp = true,
  onCopyMessage
}) => {
  const theme = useTheme();
  const isAssistant = message.role === 'assistant';
  const isUser = message.role === 'user';

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageIcon = () => {
    if (isUser) {
      return <Person fontSize="small" />;
    }
    if (isAssistant) {
      return <SmartToy fontSize="small" />;
    }
    return null;
  };

  const getMessageColor = () => {
    if (isUser) {
      return theme.palette.primary.main;
    }
    if (isAssistant) {
      return theme.palette.secondary.main;
    }
    return theme.palette.grey[500];
  };

  const getStatusIcon = () => {
    if (message.metadata?.fromKnowledgeBase) {
      return (
        <Tooltip title="Réponse de la base de connaissances">
          <CheckCircle fontSize="small" color="success" />
        </Tooltip>
      );
    }
    if (message.metadata?.dbContext?.hasDatabaseAccess) {
      return (
        <Tooltip title="Données de la base de données">
          <CheckCircle fontSize="small" color="info" />
        </Tooltip>
      );
    }
    if (message.metadata?.type === 'escalation_confirmation') {
      return (
        <Tooltip title="Escalade confirmée">
          <Warning fontSize="small" color="warning" />
        </Tooltip>
      );
    }
    return null;
  };

  const formatMessageContent = (content: string) => {
    // Formater les listes à puces
    let formatted = content.replace(/^[\s]*[-*]\s+(.+)$/gm, '• $1');
    
    // Formater les numéros de liste
    formatted = formatted.replace(/^[\s]*\d+\.\s+(.+)$/gm, (match, content) => {
      return match;
    });
    
    // Formater les sections en gras
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '**$1**');
    
    return formatted;
  };

  const renderFormattedContent = (content: string) => {
    const formatted = formatMessageContent(content);
    const lines = formatted.split('\n');
    
    return lines.map((line, index) => {
      // Ligne vide
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Titre avec **
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <Typography
            key={index}
            variant="subtitle2"
            fontWeight="bold"
            sx={{ mt: 1, mb: 0.5 }}
          >
            {line.slice(2, -2)}
          </Typography>
        );
      }
      
      // Ligne avec émojis ou icônes
      if (/^[📊🛠️🆘💡✅❌⚠️🔍]/.test(line)) {
        return (
          <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
            {line}
          </Typography>
        );
      }
      
      // Ligne normale
      return (
        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
          {line}
        </Typography>
      );
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        mb: 2,
        px: 1
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          bgcolor: getMessageColor(),
          color: theme.palette.getContrastText(getMessageColor()),
          width: 32,
          height: 32,
          mx: 1,
          mt: 0.5
        }}
      >
        {getMessageIcon()}
      </Avatar>

      {/* Message Content */}
      <Box
        sx={{
          maxWidth: '70%',
          minWidth: '120px'
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: isOwn 
              ? alpha(theme.palette.primary.main, 0.1)
              : alpha(theme.palette.grey[100], 0.8),
            border: 1,
            borderColor: isOwn 
              ? alpha(theme.palette.primary.main, 0.2)
              : alpha(theme.palette.grey[300], 0.5),
            position: 'relative'
          }}
        >
          {/* Message Content */}
          <Box>
            {renderFormattedContent(message.content)}
          </Box>

          {/* Message Metadata */}
          {(message.metadata?.fromKnowledgeBase || 
            message.metadata?.dbContext?.hasDatabaseAccess ||
            message.metadata?.type) && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {getStatusIcon()}
              {message.metadata?.intent && (
                <Chip
                  label={message.metadata.intent}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Box>
          )}

          {/* Copy Button */}
          {onCopyMessage && (
            <IconButton
              size="small"
              onClick={() => onCopyMessage(message.content)}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                opacity: 0,
                transition: 'opacity 0.2s',
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          )}
        </Paper>

        {/* Timestamp */}
        {showTimestamp && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isOwn ? 'flex-end' : 'flex-start',
              mt: 0.5,
              px: 1
            }}
          >
            <Schedule fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {formatTimestamp(message.timestamp)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MessageBubble;
