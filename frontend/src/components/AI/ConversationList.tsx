import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Search,
  MoreVert,
  Delete,
  Chat,
  Business,
  Person,
  AccessTime,
  TrendingUp,
  Support
} from '@mui/icons-material';
import { ConversationListProps, AIConversationSummary } from '../../types/aiChat.types';

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation,
  onDeleteConversation,
  loading = false
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.lastMessage.toLowerCase().includes(searchLower) ||
      conv.userId.nom.toLowerCase().includes(searchLower) ||
      conv.userId.email.toLowerCase().includes(searchLower) ||
      (conv.metadata.entrepriseId?.identification?.nomEntreprise || '').toLowerCase().includes(searchLower)
    );
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, conversationId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedConversationId(conversationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedConversationId(null);
  };

  const handleDeleteConversation = () => {
    if (selectedConversationId) {
      onDeleteConversation(selectedConversationId);
      handleMenuClose();
    }
  };

  const formatLastActivity = (date: Date | string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays}j`;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Person />;
      case 'entreprise':
        return <Business />;
      default:
        return <Chat />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return theme.palette.primary.main;
      case 'entreprise':
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const truncateMessage = (message: string, maxLength: number = 80) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Conversations
        </Typography>
        {[...Array(5)].map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Conversations
        </Typography>
        
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Rechercher dans les conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
      </Box>

      {/* Conversations List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredConversations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Chat sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              {searchTerm ? 'Aucune conversation trouvée' : 'Aucune conversation'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Essayez avec d\'autres mots-clés' : 'Commencez une nouvelle conversation'}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredConversations.map((conversation, index) => (
              <React.Fragment key={conversation._id}>
                <ListItem
                  disablePadding
                  sx={{
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  <ListItemButton
                    onClick={() => onSelectConversation(conversation._id)}
                    sx={{
                      p: 2,
                      alignItems: 'flex-start'
                    }}
                  >
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        bgcolor: getRoleColor(conversation.role),
                        color: theme.palette.getContrastText(getRoleColor(conversation.role)),
                        mr: 2,
                        width: 40,
                        height: 40
                      }}
                    >
                      {getRoleIcon(conversation.role)}
                    </Avatar>

                    {/* Content */}
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {conversation.metadata.entrepriseId?.identification?.nomEntreprise || 
                             conversation.userId.nom}
                          </Typography>
                          <Chip
                            label={conversation.role}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                          {conversation.metadata.escalated && (
                            <Chip
                              label="Escaladé"
                              size="small"
                              color="warning"
                              variant="outlined"
                              icon={<Support />}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {truncateMessage(conversation.lastMessage)}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {formatLastActivity(conversation.lastActivity)}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Chat fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {conversation.messageCount} messages
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />

                    {/* Actions */}
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuOpen(e, conversation._id)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItemButton>
                </ListItem>
                
                {index < filteredConversations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <MenuItem 
          onClick={handleDeleteConversation}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Supprimer
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ConversationList;
