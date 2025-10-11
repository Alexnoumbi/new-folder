import React from 'react';
import { Box, Typography, useTheme, Stack, LinearProgress } from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface InnovationData {
  integrationInnovation?: number;
  integrationEconomieNumerique?: number;
  utilisationIA?: number;
}

interface InnovationRadarChartProps {
  data: InnovationData;
}

const InnovationRadarChart: React.FC<InnovationRadarChartProps> = ({ data }) => {
  const theme = useTheme();

  const chartData = [
    {
      subject: 'Innovation',
      value: (data.integrationInnovation || 1) * 33.33,
      fullMark: 100
    },
    {
      subject: 'Économie Numérique',
      value: (data.integrationEconomieNumerique || 1) * 33.33,
      fullMark: 100
    },
    {
      subject: 'Intelligence Artificielle',
      value: (data.utilisationIA || 1) * 33.33,
      fullMark: 100
    }
  ];

  const averageScore = chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length;

  return (
    <Box>
      <Stack spacing={2}>
        <Box textAlign="center">
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {averageScore.toFixed(0)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Score Moyen d'Innovation
          </Typography>
        </Box>

        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={chartData}>
            <PolarGrid stroke={theme.palette.divider} />
            <PolarAngleAxis 
              dataKey="subject" 
              stroke={theme.palette.text.secondary}
              style={{ fontSize: '0.8rem' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              stroke={theme.palette.text.secondary}
            />
            <Radar
              name="Niveau"
              dataKey="value"
              stroke={theme.palette.primary.main}
              fill={theme.palette.primary.main}
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>

        <Stack spacing={1}>
          {[
            { label: 'Innovation', value: data.integrationInnovation || 1 },
            { label: 'Digitalisation', value: data.integrationEconomieNumerique || 1 },
            { label: 'IA', value: data.utilisationIA || 1 }
          ].map((item, index) => (
            <Box key={index}>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  Niveau {item.value}/3
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(item.value / 3) * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    bgcolor: theme.palette.primary.main
                  }
                }}
              />
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default InnovationRadarChart;

