import React, { useState, useEffect } from 'react';
import {
  Fab,
  Badge,
  Tooltip,
  Zoom,
  useTheme,
  alpha,
  Box,
  Typography,
  Chip
} from '@mui/material';
import {
  SmartToy,
  Support,
  Chat,
  Notifications
} from '@mui/icons-material';
import { AIFloatingButtonProps } from '../../types/aiChat.types';
import { useAuth } from '../../hooks/useAuth';
import { aiChatService } from '../../services/aiChatService';

const AIFloatingButton: React.FC<AIFloatingButtonProps> = ({
  type,
  onClick,
  hasUnreadMessages = false,
  badgeCount = 0
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Auto-hide tooltip after 3 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  // Pulse animation for new messages
  useEffect(() => {
    if (hasUnreadMessages) {
      setPulseAnimation(true);
      const timer = setTimeout(() => setPulseAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasUnreadMessages]);

  const getButtonIcon = () => {
    switch (type) {
      case 'admin':
        return <SmartToy />;
      case 'entreprise':
        return <Support />;
      default:
        return <Chat />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'admin':
        return theme.palette.primary.main;
      case 'entreprise':
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getTooltipText = () => {
    switch (type) {
      case 'admin':
        return 'Assistant IA - Accès aux données';
      case 'entreprise':
        return 'Assistant IA - Support';
      default:
        return 'Assistant IA';
    }
  };

  const getHoverTooltipText = () => {
    if (hasUnreadMessages) {
      return `Vous avez ${badgeCount} message${badgeCount > 1 ? 's' : ''} non lu${badgeCount > 1 ? 's' : ''}`;
    }
    
    switch (type) {
      case 'admin':
        return 'Posez des questions sur vos données et obtenez des analyses';
      case 'entreprise':
        return 'Obtenez de l\'aide ou escaladez vers un administrateur';
      default:
        return 'Cliquez pour commencer une conversation';
    }
  };

  const handleClick = () => {
    setShowTooltip(false);
    onClick();
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}
    >
      {/* Notification Badge */}
      {hasUnreadMessages && (
        <Zoom in={hasUnreadMessages}>
          <Chip
            label={`${badgeCount} nouveau${badgeCount > 1 ? 'x' : ''}`}
            size="small"
            color="error"
            icon={<Notifications />}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              zIndex: 1,
              animation: pulseAnimation ? 'pulse 1s infinite' : 'none',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                  opacity: 1
                },
                '50%': {
                  transform: 'scale(1.1)',
                  opacity: 0.8
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 1
                }
              }
            }}
          />
        </Zoom>
      )}

      {/* Floating Action Button */}
      <Tooltip
        title={showTooltip ? getHoverTooltipText() : getTooltipText()}
        placement="left"
        arrow
        open={showTooltip}
        onClose={() => setShowTooltip(false)}
        onOpen={() => setShowTooltip(true)}
      >
        <Fab
          color="primary"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{
            bgcolor: getButtonColor(),
            color: theme.palette.getContrastText(getButtonColor()),
            width: 64,
            height: 64,
            boxShadow: theme.shadows[8],
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: alpha(getButtonColor(), 0.9),
              transform: 'scale(1.1)',
              boxShadow: theme.shadows[12]
            },
            '&:active': {
              transform: 'scale(0.95)'
            },
            animation: pulseAnimation ? 'pulse 1s infinite' : 'none',
            '@keyframes pulse': {
              '0%': {
                boxShadow: `0 0 0 0 ${alpha(getButtonColor(), 0.7)}`
              },
              '70%': {
                boxShadow: `0 0 0 10px ${alpha(getButtonColor(), 0)}`
              },
              '100%': {
                boxShadow: `0 0 0 0 ${alpha(getButtonColor(), 0)}`
              }
            }
          }}
        >
          <Badge
            badgeContent={hasUnreadMessages ? badgeCount : 0}
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                fontWeight: 'bold',
                minWidth: 20,
                height: 20
              }
            }}
          >
            {getButtonIcon()}
          </Badge>
        </Fab>
      </Tooltip>

      {/* Optional: Status indicator */}
      {type === 'admin' && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            px: 1,
            py: 0.5,
            borderRadius: 1,
            boxShadow: theme.shadows[2],
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: theme.palette.success.main,
              animation: 'pulse 2s infinite'
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            IA Active
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AIFloatingButton;
