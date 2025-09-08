import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ArgonCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  change?: string;
  loading?: boolean;
  gradient?: boolean;
  children?: React.ReactNode; // Ajouter cette ligne
}

const StyledCard = styled(Card)<{ gradient?: boolean }>(({ theme, gradient }) => ({
  height: '100%',
  borderRadius: 16,
  boxShadow: gradient 
    ? '0 4px 20px rgba(0, 0, 0, 0.1)' 
    : '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  background: gradient 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : '#ffffff',
  color: gradient ? '#ffffff' : 'inherit',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: gradient 
      ? '0 8px 30px rgba(0, 0, 0, 0.15)' 
      : '0 4px 20px rgba(0, 0, 0, 0.12)',
  },
}));

const IconContainer = styled(Box)<{ color: string; gradient?: boolean }>(({ theme, color, gradient }) => ({
  width: 64,
  height: 64,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: gradient 
    ? 'rgba(255, 255, 255, 0.2)'
    : `${color}.light`,
  color: gradient ? '#ffffff' : `${color}.main`,
  fontSize: '1.5rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const ArgonCard: React.FC<ArgonCardProps> = ({ 
  title, 
  value, 
  subtitle,
  icon,
  color = 'primary',
  change,
  loading = false,
  gradient = false,
  children // Ajouter children
}) => (
  <StyledCard gradient={gradient}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: gradient ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem'
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h3" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              color: gradient ? '#ffffff' : 'text.primary',
              mt: 0.5,
              mb: 1
            }}
          >
            {loading ? '...' : value}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: gradient ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                fontSize: '0.875rem'
              }}
            >
              {subtitle}
            </Typography>
          )}
          {change && !loading && (
            <Chip
              label={change}
              size="small"
              sx={{
                mt: 1,
                backgroundColor: gradient ? 'rgba(255, 255, 255, 0.2)' : `${color}.light`,
                color: gradient ? '#ffffff' : `${color}.main`,
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          )}
        </Box>
        {icon && (
          <IconContainer color={color} gradient={gradient}>
            {icon}
          </IconContainer>
        )}
      </Box>
      {children && <Box sx={{ mt: 2 }}>{children}</Box>}
    </CardContent>
  </StyledCard>
);

export default ArgonCard; 