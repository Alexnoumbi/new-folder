import React from 'react';
import { Box, Typography, useTheme, Stack, Chip } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

interface FinancementData {
  ressourcesPropres?: boolean;
  subventions?: boolean;
  concoursBancaires?: boolean;
  creditsFournisseur?: boolean;
  autres?: boolean;
}

interface FinancementPieChartProps {
  data: FinancementData;
}

const FinancementPieChart: React.FC<FinancementPieChartProps> = ({ data }) => {
  const theme = useTheme();

  const sources = [
    { name: 'Ressources Propres', active: data.ressourcesPropres, color: theme.palette.primary.main },
    { name: 'Subventions', active: data.subventions, color: theme.palette.success.main },
    { name: 'Concours Bancaires', active: data.concoursBancaires, color: theme.palette.info.main },
    { name: 'Crédits Fournisseur', active: data.creditsFournisseur, color: theme.palette.warning.main },
    { name: 'Autres', active: data.autres, color: theme.palette.secondary.main }
  ];

  const activeSources = sources.filter(s => s.active);
  
  const chartData = activeSources.length > 0 
    ? activeSources.map(s => ({ name: s.name, value: 1, color: s.color }))
    : [{ name: 'Aucune source', value: 1, color: theme.palette.grey[400] }];

  return (
    <Box>
      {activeSources.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" mt={2}>
            {activeSources.map((source, index) => (
              <Chip
                key={index}
                label={source.name}
                size="small"
                sx={{
                  bgcolor: source.color,
                  color: 'white',
                  fontWeight: 600
                }}
              />
            ))}
          </Stack>
        </>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography variant="body2" color="text.secondary">
            Aucune source de financement renseignée
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FinancementPieChart;

