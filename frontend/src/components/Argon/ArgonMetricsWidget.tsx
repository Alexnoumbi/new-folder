import React from 'react';
import { Box, Typography, LinearProgress, Chip, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TrendingUp, TrendingDown, TrendingFlat, MoreVert, Refresh } from '@mui/icons-material';

interface Metric {
  id: string;
  label: string;
  value: number;
  target: number;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  description?: string;
  lastUpdated?: string;
}

interface ArgonMetricsWidgetProps {
  title: string;
  metrics: Metric[];
  showTrends?: boolean;
  showTargets?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
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

const MetricCard = styled(Box)(({ theme }) => ({
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

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return <TrendingUp />;
    case 'down': return <TrendingDown />;
    case 'stable': return <TrendingFlat />;
    default: return <TrendingFlat />;
  }
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up': return '#4caf50';
    case 'down': return '#f44336';
    case 'stable': return '#ff9800';
    default: return '#9e9e9e';
  }
};

const ArgonMetricsWidget: React.FC<ArgonMetricsWidgetProps> = ({
  title,
  metrics,
  showTrends = true,
  showTargets = true,
  onRefresh,
  loading = false
}) => {
  return (
    <WidgetContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onRefresh && (
            <Tooltip title="Actualiser">
              <IconButton
                size="small"
                onClick={onRefresh}
                disabled={loading}
                sx={{ color: 'text.secondary' }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(300px, 1fr))' }, gap: 3 }}>
        {metrics.map((metric) => {
          const percentage = (metric.value / metric.target) * 100;
          const isOverTarget = percentage > 100;
          
          return (
            <MetricCard key={metric.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {metric.label}
                  </Typography>
                  {metric.description && (
                    <Typography variant="caption" color="text.secondary">
                      {metric.description}
                    </Typography>
                  )}
                </Box>
                {showTrends && metric.trend && (
                  <Chip
                    icon={getTrendIcon(metric.trend)}
                    label={`${metric.trendValue || 0}%`}
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
                {showTargets && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    / {metric.target.toLocaleString()}
                  </Typography>
                )}
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

              {metric.lastUpdated && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Mis à jour: {new Date(metric.lastUpdated).toLocaleString('fr-FR')}
                </Typography>
              )}
            </MetricCard>
          );
        })}
      </Box>
    </WidgetContainer>
  );
};

export default ArgonMetricsWidget; 