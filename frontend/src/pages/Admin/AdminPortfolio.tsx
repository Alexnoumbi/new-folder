import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { getPortfolioStats } from '../../services/adminService';
import { PortfolioStats } from '../../types/reports.types';
import { BoxItem } from '../../components/common/BoxItem';

const AdminPortfolio: React.FC = () => {
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPortfolioStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
      console.error('Portfolio stats loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={fetchStats}>
            Réessayer
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Portfolio
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <BoxItem xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Entreprises</Typography>
                <Typography variant="h4" color="primary.main">
                  {stats?.totalEnterprises || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </BoxItem>

        <BoxItem xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Conventions Actives</Typography>
                <Typography variant="h4" color="success.main">
                  {stats?.activeConventions || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </BoxItem>

        <BoxItem xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">KPIs en Objectif</Typography>
                <Typography variant="h4" color="info.main">
                  {stats?.kpisOnTrack || 0} / {stats?.totalKPIs || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </BoxItem>
      </Box>
    </Box>
  );
};

export default AdminPortfolio;
