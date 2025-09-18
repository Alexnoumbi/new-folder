import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { getEntrepriseKPIHistory } from '../../services/entrepriseService';
import ArgonChartWidget from '../../components/Argon/ArgonChartWidget';

interface KPIDataPoint {
  date: string;
  value: number;
}

const KPIHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState<KPIDataPoint[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchKPIHistory = async () => {
      const entrepriseId = user?.entrepriseId || undefined;
      if (!entrepriseId) {
        setError('Aucune entreprise associée à votre compte');
        setLoading(false);
        return;
      }

      try {
        const data = await getEntrepriseKPIHistory(entrepriseId);
        setKpiData(data);
        setError(null);
      } catch (err: any) {
        console.error('Erreur lors du chargement de l\'historique KPI:', err);
        setError(err.response?.data?.message || 'Erreur lors du chargement de l\'historique KPI');
      } finally {
        setLoading(false);
      }
    };

    fetchKPIHistory();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Historique des KPIs
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const chartData = kpiData.map(point => ({
    label: new Date(point.date).toLocaleDateString('fr-FR', { month: 'short' }),
    value: point.value,
    color: '#4caf50'
  }));

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Historique des KPIs
      </Typography>

      <Box sx={{ mb: 4 }}>
        <ArgonChartWidget
          title="Évolution mensuelle des KPIs"
          data={chartData}
          type="bar"
          height={400}
        />
      </Box>
    </Box>
  );
};

export default KPIHistory;
