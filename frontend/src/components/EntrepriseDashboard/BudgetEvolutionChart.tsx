import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BudgetData {
  date: string | Date;
  ca: number;
  couts: number;
  devise: string;
}

interface BudgetEvolutionChartProps {
  data: BudgetData[];
}

const BudgetEvolutionChart: React.FC<BudgetEvolutionChartProps> = ({ data }) => {
  const theme = useTheme();

  const chartData = data.map(item => ({
    date: format(new Date(item.date), 'MMM yyyy', { locale: fr }),
    'Chiffre d\'Affaires': item.ca,
    'Coûts de Production': item.couts
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Évolution financière ({data[0]?.devise || 'FCFA'})
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCouts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="date" 
            stroke={theme.palette.text.secondary}
            style={{ fontSize: '0.875rem' }}
          />
          <YAxis 
            stroke={theme.palette.text.secondary}
            style={{ fontSize: '0.875rem' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8
            }}
            formatter={(value: number) => [formatCurrency(value), '']}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="Chiffre d'Affaires" 
            stroke={theme.palette.success.main}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCA)"
          />
          <Area 
            type="monotone" 
            dataKey="Coûts de Production" 
            stroke={theme.palette.warning.main}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCouts)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BudgetEvolutionChart;

