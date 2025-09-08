import React from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

interface Metric {
  label: string;
  value: number;
  target: number;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}

interface ArgonMetricsProps {
  title: string;
  metrics: Metric[];
  showTrends?: boolean;
}

const MetricCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
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

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up': return '#4caf50';
    case 'down': return '#f44336';
    case 'stable': return '#ff9800';
    default: return '#9e9e9e';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return '↗';
    case 'down': return '↘';
    case 'stable': return '→';
    default: return '';
  }
};

const ArgonMetrics: React.FC<ArgonMetricsProps> = ({ title, metrics, showTrends = true }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
        {title}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(300px, 1fr))' }, gap: 3 }}>
        {metrics.map((metric, index) => {
          const percentage = (metric.value / metric.target) * 100;
          const isOverTarget = percentage > 100;
          
          return (
            <MetricCard key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {metric.label}
                </Typography>
                {showTrends && metric.trend && (
                  <Chip
                    label={`${getTrendIcon(metric.trend)} ${metric.trendValue || 0}%`}
                    size="small"
                    sx={{
                      backgroundColor: getTrendColor(metric.trend),
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {metric.value.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {metric.unit || ''}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  / {metric.target.toLocaleString()}
                </Typography>
              </Box>
              
              <StyledProgress
                variant="determinate"
                value={Math.min(percentage, 100)}
                color={metric.color || 'primary'}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {percentage.toFixed(1)}% de l'objectif
                </Typography>
                {isOverTarget && (
                  <Chip
                    label="Objectif dépassé"
                    size="small"
                    sx={{
                      backgroundColor: '#4caf50',
                      color: '#ffffff',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                    }}
                  />
                )}
              </Box>
            </MetricCard>
          );
        })}
      </Box>
    </Box>
  );
};

export default ArgonMetrics; 