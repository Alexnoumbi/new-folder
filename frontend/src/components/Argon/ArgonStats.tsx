import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ArgonStatsProps {
  label: string;
  value: number;
  total: number;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  showPercentage?: boolean;
}

const StatsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
}));

const StyledProgress = styled(LinearProgress)<{ color: string }>(({ theme, color }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    backgroundColor: `${color}.main`,
  },
}));

const ArgonStats: React.FC<ArgonStatsProps> = ({ 
  label, 
  value, 
  total, 
  color = 'primary',
  showPercentage = true
}) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <StatsContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: `${color}.main` }}>
          {value}/{total}
        </Typography>
      </Box>
      <StyledProgress 
        variant="determinate" 
        value={percentage} 
        color={color}
      />
      {showPercentage && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {percentage.toFixed(1)}% complété
        </Typography>
      )}
    </StatsContainer>
  );
};

export default ArgonStats; 