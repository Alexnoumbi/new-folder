import React from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ComputerIcon from '@mui/icons-material/Computer';

interface UsageStatsProps {
  stats: {
    mobile: number;
    web: number;
    totalUsers: number;
  } | null;
}

const COLORS = ['#3f51b5', '#f50057'];

const UsageStats: React.FC<UsageStatsProps> = ({ stats }) => {
  if (!stats) return null;

  const data = [
    { name: 'Mobile', value: stats.mobile, icon: <PhoneAndroidIcon /> },
    { name: 'Web', value: stats.web, icon: <ComputerIcon /> }
  ];

  const totalUsers = stats.mobile + stats.web;
  const mobilePercentage = ((stats.mobile / totalUsers) * 100).toFixed(1);
  const webPercentage = ((stats.web / totalUsers) * 100).toFixed(1);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Statistiques d'Utilisation
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <PhoneAndroidIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6">
              {stats.mobile}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Utilisateurs Mobile ({mobilePercentage}%)
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <ComputerIcon sx={{ fontSize: 40, color: COLORS[1] }} />
            <Typography variant="h6">
              {stats.web}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Utilisateurs Web ({webPercentage}%)
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default UsageStats;
