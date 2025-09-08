import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close, CheckCircle, Warning, Error, Info } from '@mui/icons-material';

interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  read?: boolean;
  onClose?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
}

const NotificationCard = styled(Box)<{ type: string; read?: boolean }>(({ theme, type, read }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  backgroundColor: read ? '#f8fafc' : '#ffffff',
  border: '1px solid #e2e8f0',
  boxShadow: read ? '0 1px 3px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  opacity: read ? 0.7 : 1,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
  },
}));

const getTypeColor = (type: string) => {
  switch (type) {
    case 'success': return '#4caf50';
    case 'warning': return '#ff9800';
    case 'error': return '#f44336';
    case 'info': return '#2196f3';
    default: return '#9e9e9e';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'success': return <CheckCircle />;
    case 'warning': return <Warning />;
    case 'error': return <Error />;
    case 'info': return <Info />;
    default: return <Info />;
  }
};

const ArgonNotification: React.FC<NotificationProps> = ({
  id,
  title,
  message,
  type,
  timestamp,
  read = false,
  onClose,
  onMarkAsRead
}) => {
  return (
    <NotificationCard
      type={type}
      read={read}
      onClick={() => onMarkAsRead?.(id)}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            color: getTypeColor(type),
            fontSize: '1.25rem',
            mt: 0.5,
          }}
        >
          {getTypeIcon(type)}
        </Box>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={type}
                size="small"
                sx={{
                  backgroundColor: getTypeColor(type),
                  color: '#ffffff',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                }}
              />
              {onClose && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(id);
                  }}
                  sx={{ color: 'text.secondary' }}
                >
                  <Close />
                </IconButton>
              )}
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {message}
          </Typography>
          
          <Typography variant="caption" color="text.secondary">
            {new Date(timestamp).toLocaleString('fr-FR')}
          </Typography>
        </Box>
      </Box>
    </NotificationCard>
  );
};

export default ArgonNotification; 