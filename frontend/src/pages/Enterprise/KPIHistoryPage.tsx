import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Assessment,
  CalendarToday,
  Download,
  Refresh
} from '@mui/icons-material';
import { KPIHistory } from '../../types/kpi.types';
import { getKPIHistory } from '../../services/kpiService';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonChartWidget from '../../components/Argon/ArgonChartWidget';
import ArgonRealtimeWidget from '../../components/Argon/ArgonRealtimeWidget';

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'success';
    case 'down':
      return 'error';
    default:
      return 'info';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <TrendingUp color="success" />;
    case 'down':
      return <TrendingDown color="error" />;
    default:
      return <TrendingFlat color="action" />;
  }
};

const KPIHistoryPage: React.FC = () => {
  const [kpiHistory, setKpiHistory] = useState<KPIHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchKPIHistory();
  }, [selectedPeriod]);

  const fetchKPIHistory = async () => {
    try {
      setLoading(true);
      const data = await getKPIHistory(selectedPeriod);
      setKpiHistory(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement de l\'historique des KPI');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Entreprise', href: '/enterprise' },
    { label: 'Historique KPI' }
  ];

  const headerActions = [
    {
      label: 'Exporter',
      icon: <Download />,
      onClick: () => console.log('Exporter historique KPI'),
      variant: 'outlined' as const,
      color: 'primary' as const
    },
    {
      label: 'Actualiser',
      icon: <Refresh />,
      onClick: fetchKPIHistory,
      variant: 'contained' as const,
      color: 'primary' as const
    }
  ];

  // Données pour les graphiques
  const performanceData = [
    { label: 'Q1', value: 85, color: '#4caf50' },
    { label: 'Q2', value: 92, color: '#2196f3' },
    { label: 'Q3', value: 78, color: '#ff9800' },
    { label: 'Q4', value: 95, color: '#9c27b0' }
  ];

  const categoryData = [
    { label: 'Performance', value: 45, color: '#4caf50' },
    { label: 'Qualité', value: 30, color: '#2196f3' },
    { label: 'Efficacité', value: 15, color: '#ff9800' },
    { label: 'Satisfaction', value: 10, color: '#9c27b0' }
  ];

  // Données temps réel pour démonstration
  const realtimeData = [
    { timestamp: Date.now() - 5000, value: 85, label: 'KPI Global' },
    { timestamp: Date.now() - 4000, value: 87, label: 'KPI Global' },
    { timestamp: Date.now() - 3000, value: 89, label: 'KPI Global' },
    { timestamp: Date.now() - 2000, value: 91, label: 'KPI Global' },
    { timestamp: Date.now() - 1000, value: 88, label: 'KPI Global' },
  ];

  // Statistiques des KPI
  const kpiStats = [
    {
      title: 'Score Moyen',
      value: `${Math.round(kpiHistory.reduce((acc, kpi) => acc + kpi.value, 0) / kpiHistory.length) || 0}/100`,
      icon: <Assessment />,
      color: 'primary' as const,
      change: '+5%'
    },
    {
      title: 'KPI Améliorés',
      value: kpiHistory.filter(kpi => kpi.trend === 'up').length,
      icon: <TrendingUp />,
      color: 'success' as const,
      change: '+3'
    },
    {
      title: 'KPI Stables',
      value: kpiHistory.filter(kpi => kpi.trend === 'flat').length,
      icon: <TrendingFlat />,
      color: 'info' as const,
      change: '+1'
    },
    {
      title: 'KPI en Baisse',
      value: kpiHistory.filter(kpi => kpi.trend === 'down').length,
      icon: <TrendingDown />,
      color: 'warning' as const,
      change: '-2'
    }
  ];

  if (error) {
    return (
      <Box>
        <ArgonPageHeader
          title="Historique des KPI"
          subtitle="Suivi de l'évolution des indicateurs de performance"
          breadcrumbs={breadcrumbs}
          actions={headerActions}
        />
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <ArgonPageHeader
        title="Historique des KPI"
        subtitle="Suivi de l'évolution des indicateurs de performance"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
        onRefresh={fetchKPIHistory}
        loading={loading}
      />

      {/* Statistiques des KPI */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        {kpiStats.map((stat, index) => (
          <ArgonCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
            loading={loading}
          />
        ))}
      </Box>

      {/* Widget temps réel */}
      <Box sx={{ mb: 4 }}>
        <ArgonRealtimeWidget
          title="Évolution KPI en Temps Réel"
          data={realtimeData}
          color="#667eea"
          unit="%"
          threshold={{ warning: 80, critical: 95 }}
        />
      </Box>

      {/* Graphiques de performance */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 3, 
        mb: 4 
      }}>
        <ArgonChartWidget
          title="Performance par Trimestre"
          data={performanceData}
          type="bar"
          height={300}
        />
        
        <ArgonChartWidget
          title="Répartition par Catégorie"
          data={categoryData}
          type="pie"
          height={300}
        />
      </Box>

      {/* Détails des KPI */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 3 
      }}>
        <ArgonCard
          title="KPI Récents"
          value=""
          icon={<CalendarToday />}
          color="primary"
        >
          <Box sx={{ mt: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : kpiHistory.length > 0 ? (
              kpiHistory.slice(0, 5).map((kpi, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {kpi.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {kpi.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {kpi.unit}
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={kpi.value}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      mb: 1,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getTrendColor(kpi.trend || 'flat') === 'success' ? '#4caf50' :
                                       getTrendColor(kpi.trend || 'flat') === 'error' ? '#f44336' : '#2196f3'
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getTrendIcon(kpi.trend || 'flat')}
                    <Typography variant="caption" color="text.secondary">
                      {kpi.change || 0}%
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">Aucun historique disponible</Typography>
            )}
          </Box>
        </ArgonCard>

        <ArgonCard
          title="Tendances"
          value=""
          icon={<TrendingUp />}
          color="success"
        >
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Améliorations
              </Typography>
              <Chip
                label={kpiHistory.filter(kpi => kpi.trend === 'up').length}
                size="small"
                sx={{ backgroundColor: '#4caf50', color: '#ffffff' }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Stables
              </Typography>
              <Chip
                label={kpiHistory.filter(kpi => kpi.trend === 'flat').length}
                size="small"
                sx={{ backgroundColor: '#2196f3', color: '#ffffff' }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                En baisse
              </Typography>
              <Chip
                label={kpiHistory.filter(kpi => kpi.trend === 'down').length}
                size="small"
                sx={{ backgroundColor: '#ff9800', color: '#ffffff' }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Période
              </Typography>
              <Chip
                label={selectedPeriod === 'month' ? 'Mensuel' : 'Annuel'}
                size="small"
                sx={{ backgroundColor: '#9c27b0', color: '#ffffff' }}
              />
            </Box>
          </Box>
        </ArgonCard>
      </Box>
    </Box>
  );
};

export default KPIHistoryPage;
