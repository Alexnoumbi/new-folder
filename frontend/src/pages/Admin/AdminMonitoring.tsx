import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Memory,
  Storage,
  Speed,
  Security,
  Warning,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { getSystemStats, SystemStats } from '../../services/monitoringService';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonChart from '../../components/Argon/ArgonChart';
import ArgonMetrics from '../../components/Argon/ArgonMetrics';

const AdminMonitoring: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getSystemStats();
        setStats(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques système');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Actualisation toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Monitoring Système
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Données de démonstration pour les métriques
  const performanceMetrics = [
    {
      label: 'CPU Usage',
      value: stats?.cpuUsage || 45,
      target: 80,
      unit: '%',
      color: 'primary' as const,
      trend: 'up' as const,
      trendValue: 5
    },
    {
      label: 'Memory Usage',
      value: stats?.memoryUsage || 62,
      target: 85,
      unit: '%',
      color: 'warning' as const,
      trend: 'stable' as const,
      trendValue: 0
    },
    {
      label: 'Disk Usage',
      value: stats?.diskUsage || 38,
      target: 90,
      unit: '%',
      color: 'success' as const,
      trend: 'down' as const,
      trendValue: -2
    },
    {
      label: 'Network I/O',
      value: stats?.networkIO || 25,
      target: 70,
      unit: 'MB/s',
      color: 'info' as const,
      trend: 'up' as const,
      trendValue: 8
    }
  ];

  const getStatusColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'error';
    if (value >= threshold * 0.8) return 'warning';
    return 'success';
  };

  const getStatusIcon = (value: number, threshold: number) => {
    if (value >= threshold) return <Error />;
    if (value >= threshold * 0.8) return <Warning />;
    return <CheckCircle />;
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Monitoring Système
      </Typography>

      {/* Cartes de statut système */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        <ArgonCard
          title="CPU"
          value={`${stats?.cpuUsage || 0}%`}
          icon={getStatusIcon(stats?.cpuUsage || 0, 80)}
          color={getStatusColor(stats?.cpuUsage || 0, 80)}
          change={stats?.cpuTrend || '+2%'}
          loading={loading}
          gradient={Boolean(stats?.cpuUsage && stats.cpuUsage > 80)}
        />
        <ArgonCard
          title="Mémoire"
          value={`${stats?.memoryUsage || 0}%`}
          icon={getStatusIcon(stats?.memoryUsage || 0, 85)}
          color={getStatusColor(stats?.memoryUsage || 0, 85)}
          change={stats?.memoryTrend || '+1%'}
          loading={loading}
          gradient={Boolean(stats?.memoryUsage && stats.memoryUsage > 85)}
        />
        <ArgonCard
          title="Stockage"
          value={`${stats?.diskUsage || 0}%`}
          icon={getStatusIcon(stats?.diskUsage || 0, 90)}
          color={getStatusColor(stats?.diskUsage || 0, 90)}
          change={stats?.diskTrend || '0%'}
          loading={loading}
          gradient={Boolean(stats?.diskUsage && stats.diskUsage > 90)}
        />
        <ArgonCard
          title="Sécurité"
          value={stats?.securityAlerts || 0}
          icon={stats?.securityAlerts && stats.securityAlerts > 0 ? <Security /> : <CheckCircle />}
          color={stats?.securityAlerts && stats.securityAlerts > 0 ? 'error' : 'success'}
          change={stats?.securityTrend || '0'}
          loading={loading}
          gradient={Boolean(stats?.securityAlerts && stats.securityAlerts > 0)}
        />
      </Box>

      {/* Métriques de performance */}
      <ArgonMetrics
        title="Métriques de Performance"
        metrics={performanceMetrics}
        showTrends={true}
      />

      {/* Graphiques de monitoring */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
        gap: 3, 
        mt: 4 
      }}>
        <ArgonChart
          title="Utilisation CPU en Temps Réel"
          icon={<Memory />}
          height={300}
        >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 2,
                  border: '2px dashed #e0e0e0',
                }}
              >
                <Typography color="textSecondary" variant="h6">
                  Graphique CPU
                </Typography>
              </Box>
            )}
          </ArgonChart>
        <ArgonChart
          title="Utilisation Mémoire"
          icon={<Storage />}
          height={300}
        >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 2,
                  border: '2px dashed #e0e0e0',
                }}
              >
                <Typography color="textSecondary" variant="h6">
                  Graphique Mémoire
                </Typography>
              </Box>
            )}
          </ArgonChart>
      </Box>
    </Box>
  );
};

export default AdminMonitoring;
