import React from 'react';
import { Box, Typography, LinearProgress, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PerformanceData {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

interface ArgonPerformanceWidgetProps {
  title: string;
  data: PerformanceData[];
  type?: 'linear' | 'circular';
  showValues?: boolean;
}

const WidgetContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledLinearProgress = styled(LinearProgress)<{ color: string }>(({ theme, color }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    backgroundColor: `${color}.main`,
  },
}));

const CircularContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const CircularText = styled(Box)(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ArgonPerformanceWidget: React.FC<ArgonPerformanceWidgetProps> = ({
  title,
  data,
  type = 'linear',
  showValues = true
}) => {
  const getColor = (color?: string): 'primary' | 'success' | 'warning' | 'error' | 'info' => {
    if (color === 'success' || color === 'warning' || color === 'error' || color === 'info') {
      return color;
    }
    return 'primary';
  };

  if (type === 'circular' && data.length === 1) {
    const item = data[0];
    const percentage = (item.value / item.max) * 100;
    
    return (
      <WidgetContainer>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularContainer>
            <CircularProgress
              variant="determinate"
              value={percentage}
              size={120}
              thickness={4}
              sx={{
                color: `${getColor(item.color)}.main`,
              }}
            />
            <CircularText>
              <Typography variant="h4" sx={{ fontWeight: 700, color: `${getColor(item.color)}.main` }}>
                {item.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.unit || ''}
              </Typography>
            </CircularText>
          </CircularContainer>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
          {item.label}
        </Typography>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {data.map((item, index) => {
          const percentage = (item.value / item.max) * 100;
          
          return (
            <Box key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {item.label}
                </Typography>
                {showValues && (
                  <Typography variant="h6" sx={{ fontWeight: 600, color: `${getColor(item.color)}.main` }}>
                    {item.value}{item.unit || ''}
                  </Typography>
                )}
              </Box>
              <StyledLinearProgress
                variant="determinate"
                value={percentage}
                color={getColor(item.color) as any}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {percentage.toFixed(1)}% de {item.max}{item.unit || ''}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </WidgetContainer>
  );
};

export default ArgonPerformanceWidget; 