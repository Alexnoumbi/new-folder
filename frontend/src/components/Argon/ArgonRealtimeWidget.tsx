import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Chip, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PlayArrow, Pause, Refresh, TrendingUp, TrendingDown } from '@mui/icons-material';

interface RealtimeData {
  timestamp: number;
  value: number;
  label: string;
}

interface ArgonRealtimeWidgetProps {
  title: string;
  data: RealtimeData[];
  maxDataPoints?: number;
  updateInterval?: number;
  color?: string;
  unit?: string;
  threshold?: {
    warning: number;
    critical: number;
  };
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

const ChartContainer = styled(Box)(({ theme }) => ({
  height: 200,
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#f8fafc',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
}));

const DataPoint = styled(Box)<{ x: number; y: number; color: string }>(({ x, y, color }) => ({
  position: 'absolute',
  left: `${x}%`,
  top: `${y}%`,
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: color,
  transform: 'translate(-50%, -50%)',
  transition: 'all 0.3s ease',
}));

const DataLine = styled(Box)<{ points: string; color: string }>(({ points, color }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(to right, ${color}22, transparent)`,
    clipPath: `polygon(${points})`,
  },
}));

const ArgonRealtimeWidget: React.FC<ArgonRealtimeWidgetProps> = ({
  title,
  data,
  maxDataPoints = 20,
  updateInterval = 1000,
  color = '#667eea',
  unit = '',
  threshold
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentData, setCurrentData] = useState<RealtimeData[]>([]);
  const [currentValue, setCurrentValue] = useState(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    if (data.length > 0) {
      setCurrentData(data.slice(-maxDataPoints));
      setCurrentValue(data[data.length - 1]?.value || 0);
    }
  }, [data, maxDataPoints]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentData(prev => {
        const newData = [...prev];
        if (newData.length >= maxDataPoints) {
          newData.shift();
        }
        
        // Simuler de nouvelles données
        const lastValue = newData[newData.length - 1]?.value || 0;
        const variation = (Math.random() - 0.5) * 10;
        const newValue = Math.max(0, lastValue + variation);
        
        newData.push({
          timestamp: Date.now(),
          value: newValue,
          label: 'Nouvelle donnée'
        });

        setCurrentValue(newValue);
        
        // Calculer la tendance
        if (newData.length >= 2) {
          const prevValue = newData[newData.length - 2].value;
          if (newValue > prevValue) setTrend('up');
          else if (newValue < prevValue) setTrend('down');
          else setTrend('stable');
        }

        return newData;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isPlaying, updateInterval, maxDataPoints]);

  const getStatusColor = () => {
    if (!threshold) return color;
    if (currentValue >= threshold.critical) return '#f44336';
    if (currentValue >= threshold.warning) return '#ff9800';
    return '#4caf50';
  };

  const getStatusLabel = () => {
    if (!threshold) return 'Normal';
    if (currentValue >= threshold.critical) return 'Critique';
    if (currentValue >= threshold.warning) return 'Attention';
    return 'Normal';
  };

  const renderChart = () => {
    if (currentData.length < 2) return null;

    const maxValue = Math.max(...currentData.map(d => d.value));
    const minValue = Math.min(...currentData.map(d => d.value));
    const range = maxValue - minValue || 1;

    const points = currentData.map((point, index) => {
      const x = (index / (currentData.length - 1)) * 100;
      const y = 100 - ((point.value - minValue) / range) * 100;
      return `${x}% ${y}%`;
    }).join(',');

    return (
      <ChartContainer>
        <DataLine points={points} color={color} />
        {currentData.map((point, index) => {
          const x = (index / (currentData.length - 1)) * 100;
          const y = 100 - ((point.value - minValue) / range) * 100;
          return (
            <DataPoint
              key={index}
              x={x}
              y={y}
              color={color}
            />
          );
        })}
      </ChartContainer>
    );
  };

  return (
    <WidgetContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={getStatusLabel()}
            size="small"
            sx={{
              backgroundColor: getStatusColor(),
              color: '#ffffff',
              fontWeight: 500,
            }}
          />
          <IconButton
            size="small"
            onClick={() => setIsPlaying(!isPlaying)}
            sx={{ color: 'text.secondary' }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: getStatusColor() }}>
          {currentValue.toFixed(1)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          {unit}
        </Typography>
        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
          {trend === 'up' && <TrendingUp sx={{ color: '#4caf50' }} />}
          {trend === 'down' && <TrendingDown sx={{ color: '#f44336' }} />}
          {trend === 'stable' && <Box sx={{ width: 24, height: 2, backgroundColor: '#ff9800', borderRadius: 1 }} />}
        </Box>
      </Box>

      {renderChart()}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {currentData.length} points de données
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Mis à jour: {new Date().toLocaleTimeString('fr-FR')}
        </Typography>
      </Box>
    </WidgetContainer>
  );
};

export default ArgonRealtimeWidget; 