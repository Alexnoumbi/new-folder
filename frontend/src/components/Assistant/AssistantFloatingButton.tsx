import React from 'react';
import {
  Fab,
  Badge,
  Box,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  QuestionAnswer,
  HelpOutline
} from '@mui/icons-material';

interface AssistantFloatingButtonProps {
  type: 'admin' | 'entreprise';
  onClick: () => void;
  hasUnreadMessages?: boolean;
  badgeCount?: number;
}

const AssistantFloatingButton: React.FC<AssistantFloatingButtonProps> = ({
  type,
  onClick,
  hasUnreadMessages = false,
  badgeCount = 0
}) => {
  const theme = useTheme();

  const getButtonColor = () => {
    return type === 'admin' ? 'secondary' : 'primary';
  };

  const getTooltipText = () => {
    return type === 'admin' 
      ? 'Assistant Admin - Posez vos questions'
      : 'Assistant Entreprise - Besoin d\'aide ?';
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      <Tooltip title={getTooltipText()} placement="left">
        <Badge
          badgeContent={badgeCount}
          color="error"
          invisible={!hasUnreadMessages || badgeCount === 0}
          sx={{
            '& .MuiBadge-badge': {
              top: 8,
              right: 8,
              fontSize: '0.75rem',
              minWidth: '20px',
              height: '20px'
            }
          }}
        >
          <Fab
            color={getButtonColor()}
            onClick={onClick}
            sx={{
              width: 64,
              height: 64,
              background: type === 'admin' 
                ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
                : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 8px 32px ${alpha(
                type === 'admin' ? theme.palette.secondary.main : theme.palette.primary.main, 
                0.3
              )}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px) scale(1.05)',
                boxShadow: `0 12px 40px ${alpha(
                  type === 'admin' ? theme.palette.secondary.main : theme.palette.primary.main, 
                  0.4
                )}`,
                background: type === 'admin'
                  ? `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
              },
              '&:active': {
                transform: 'translateY(-2px) scale(1.02)'
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <QuestionAnswer 
                sx={{ 
                  fontSize: 28,
                  color: 'white',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }} 
              />
              
              {/* Animation pulse pour indiquer l'activité */}
              {hasUnreadMessages && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.error.main,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(0.95)',
                        boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.7)}`
                      },
                      '70%': {
                        transform: 'scale(1)',
                        boxShadow: `0 0 0 10px ${alpha(theme.palette.error.main, 0)}`
                      },
                      '100%': {
                        transform: 'scale(0.95)',
                        boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}`
                      }
                    }
                  }}
                />
              )}
            </Box>
          </Fab>
        </Badge>
      </Tooltip>
    </Box>
  );
};

export default AssistantFloatingButton;
