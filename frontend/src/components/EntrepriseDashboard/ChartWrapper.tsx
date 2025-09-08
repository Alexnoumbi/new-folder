import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
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

interface ChartWrapperProps {
  title: string;
  data: Array<{
    date: string;
    value: number;
    indicator: string;
    unit?: string;
  }>;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({ title, data }) => {
  // Group data by indicator
  const indicators = Array.from(new Set(data.map(item => item.indicator)));

  // Transform data for Recharts
  const transformedData = data.reduce((acc: any[], curr) => {
    const dateExists = acc.find(item => item.date === curr.date);
    if (dateExists) {
      (dateExists as any)[curr.indicator] = curr.value;
    } else {
      const newEntry: any = { date: curr.date };
      newEntry[curr.indicator] = curr.value;
      acc.push(newEntry);
    }
    return acc;
  }, []);

  // Colors for different indicators
  const colors = ['#2196f3', '#4caf50', '#ff9800', '#f44336'];

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString('fr-FR')}
              {data.find(d => d.indicator === entry.name)?.unit || ''}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper sx={{ p: 2, height: '400px' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toLocaleString('fr-FR')}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {indicators.map((indicator, index) => (
            <Line
              key={indicator}
              type="monotone"
              dataKey={indicator}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default ChartWrapper;
