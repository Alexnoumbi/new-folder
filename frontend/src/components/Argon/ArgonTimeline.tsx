import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
  user?: string;
}

interface ArgonTimelineProps {
  items: TimelineItem[];
  title?: string;
}

const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingLeft: theme.spacing(3),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    width: 2,
    background: 'linear-gradient(to bottom, #667eea, #764ba2)',
    borderRadius: 1,
  },
}));

const TimelineItem = styled(Box)<{ type: string }>(({ theme, type }) => ({
  position: 'relative',
  marginBottom: theme.spacing(3),
  paddingLeft: theme.spacing(3),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: -6,
    top: 8,
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: type === 'success' ? '#4caf50' : 
                    type === 'warning' ? '#ff9800' : 
                    type === 'error' ? '#f44336' : '#2196f3',
    border: '3px solid #ffffff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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

const ArgonTimeline: React.FC<ArgonTimelineProps> = ({ items, title }) => (
  <Box>
    {title && (
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
        {title}
      </Typography>
    )}
    <TimelineContainer>
      {items.map((item) => (
        <TimelineItem key={item.id} type={item.type}>
          <Box sx={{ 
            backgroundColor: '#ffffff',
            padding: 2,
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {item.title}
              </Typography>
              <Chip
                label={item.type}
                size="small"
                sx={{
                  backgroundColor: getTypeColor(item.type),
                  color: '#ffffff',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {item.description}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {item.user && `${item.user} • `}
                {new Date(item.timestamp).toLocaleString('fr-FR')}
              </Typography>
            </Box>
          </Box>
        </TimelineItem>
      ))}
    </TimelineContainer>
  </Box>
);

export default ArgonTimeline; 