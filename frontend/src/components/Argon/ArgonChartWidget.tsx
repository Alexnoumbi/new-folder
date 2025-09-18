import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ArgonChartWidgetProps {
  title: string;
  data: ChartData[];
  type?: 'bar' | 'pie' | 'line';
  height?: number;
}

const ChartContainer = styled(Box)(({ theme }) => ({
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

const BarChart = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'end',
  height: 200,
  gap: theme.spacing(1),
}));

const Bar = styled(Box, { shouldForwardProp: (prop) => prop !== 'barHeight' && prop !== 'barColor' })<{
  barHeight: number;
  barColor: string;
}>(({ barHeight, barColor }) => ({
  flex: 1,
  height: `${barHeight}%`,
  backgroundColor: barColor,
  borderRadius: '4px 4px 0 0',
  transition: 'all 0.3s ease',
  '&:hover': {
    opacity: 0.8,
  },
}));

const PieChart = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 200,
  height: 200,
  borderRadius: '50%',
  margin: '0 auto',
}));

const PieSlice = styled(Box, { shouldForwardProp: (prop) => prop !== 'startAngle' && prop !== 'endAngle' && prop !== 'sliceColor' })<{
  startAngle: number;
  endAngle: number;
  sliceColor: string;
}>(({ startAngle, endAngle, sliceColor }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  background: `conic-gradient(from ${startAngle}deg, ${sliceColor} 0deg ${endAngle}deg, transparent ${endAngle}deg)`,
}));

const ArgonChartWidget: React.FC<ArgonChartWidgetProps> = ({
  title,
  data,
  type = 'bar',
  height = 300
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  const renderBarChart = () => (
    <BarChart>
      {data.map((item, index) => (
        <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Bar
            barHeight={(item.value / (maxValue || 1)) * 100}
            barColor={item.color || '#667eea'}
          />
          <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </BarChart>
  );

  const renderPieChart = () => {
    let currentAngle = 0;

    return (
      <PieChart>
        {data.map((item, index) => {
          const percentage = totalValue === 0 ? 0 : (item.value / totalValue) * 100;
          const sliceAngle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + sliceAngle;

          currentAngle += sliceAngle;

          return (
            <PieSlice
              key={index}
              startAngle={startAngle}
              endAngle={endAngle}
              sliceColor={item.color || '#667eea'}
            />
          );
        })}
      </PieChart>
    );
  };

  const renderLineChart = () => (
    <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 1 }}>
      {data.map((item, index) => (
        <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            sx={{
              width: '100%',
              height: `${(item.value / (maxValue || 1)) * 100}%`,
              backgroundColor: item.color || '#667eea',
              borderRadius: '4px 4px 0 0',
              transition: 'all 0.3s ease',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          />
          <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <ChartContainer sx={{ height }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
        {title}
      </Typography>

      {type === 'bar' && renderBarChart()}
      {type === 'pie' && renderPieChart()}
      {type === 'line' && renderLineChart()}

      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: item.color || '#667eea',
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {item.label}: {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </ChartContainer>
  );
};

export default ArgonChartWidget;
