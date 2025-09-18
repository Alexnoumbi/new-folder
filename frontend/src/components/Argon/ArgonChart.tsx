import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ArgonChartProps {
  title: string;
  children: React.ReactNode;
  height?: number;
  gradient?: boolean;
  icon?: React.ReactNode;
}

const StyledCard = styled(Card)<{ $gradient?: boolean }>(({ theme, $gradient }) => ({
  borderRadius: 16,
  boxShadow: $gradient 
    ? '0 4px 20px rgba(0, 0, 0, 0.1)' 
    : '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  background: $gradient 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : '#ffffff',
  color: $gradient ? '#ffffff' : 'inherit',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: $gradient 
      ? '0 8px 30px rgba(0, 0, 0, 0.15)' 
      : '0 4px 20px rgba(0, 0, 0, 0.12)',
  },
}));

const ChartHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
}));

const ArgonChart: React.FC<ArgonChartProps> = ({ 
  title, 
  children, 
  height = 300,
  gradient = false,
  icon
}) => (
  <StyledCard $gradient={gradient}>
    <CardContent sx={{ p: 3 }}>
      <ChartHeader>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: gradient ? '#ffffff' : 'text.primary'
          }}
        >
          {title}
        </Typography>
        {icon && (
          <Box sx={{ 
            color: gradient ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
            fontSize: '1.25rem'
          }}>
            {icon}
          </Box>
        )}
      </ChartHeader>
      <Box sx={{ height, position: 'relative' }}>
        {children}
      </Box>
    </CardContent>
  </StyledCard>
);

export default ArgonChart; 