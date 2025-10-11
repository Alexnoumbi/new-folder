import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PersonnelData {
  date: string | Date;
  effectifs: number;
  nouveauxEmplois: number;
}

interface PersonnelEvolutionChartProps {
  data: PersonnelData[];
}

const PersonnelEvolutionChart: React.FC<PersonnelEvolutionChartProps> = ({ data }) => {
  const theme = useTheme();

  const chartData = data.map(item => ({
    date: format(new Date(item.date), 'MMM yyyy', { locale: fr }),
    Effectifs: item.effectifs,
    'Nouveaux Emplois': item.nouveauxEmplois
  }));

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Évolution sur les {data.length} dernières révisions
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="date" 
            stroke={theme.palette.text.secondary}
            style={{ fontSize: '0.875rem' }}
          />
          <YAxis 
            stroke={theme.palette.text.secondary}
            style={{ fontSize: '0.875rem' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Effectifs" 
            stroke={theme.palette.primary.main}
            strokeWidth={3}
            dot={{ fill: theme.palette.primary.main, r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line 
            type="monotone" 
            dataKey="Nouveaux Emplois" 
            stroke={theme.palette.success.main}
            strokeWidth={3}
            dot={{ fill: theme.palette.success.main, r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PersonnelEvolutionChart;

