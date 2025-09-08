import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import {
  Business,
  Assessment,
  Description,
  CalendarToday,
  TrendingUp,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { getEntrepriseStats, EntrepriseStats } from '../../services/entrepriseService';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonChart from '../../components/Argon/ArgonChart';
import ArgonChartWidget from '../../components/Argon/ArgonChartWidget';
import ArgonPerformanceWidget from '../../components/Argon/ArgonPerformanceWidget';
import ComplianceTrafficLight from '../../components/EntrepriseDashboard/ComplianceTrafficLight';
import KPIWidget from '../../components/EntrepriseDashboard/KPIWidget';
import VisitsCalendar from '../../components/EntrepriseDashboard/VisitsCalendar';
import DocumentsGallery from '../../components/Documents/DocumentsGallery';

const EnterpriseDashboard: React.FC = () => {
  const [stats, setStats] = useState<EntrepriseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getEntrepriseStats();
        setStats(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Tableau de bord Entreprise
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Données pour les graphiques
  const kpiData = [
    { label: 'Q1', value: 85, color: '#4caf50' },
    { label: 'Q2', value: 92, color: '#2196f3' },
    { label: 'Q3', value: 78, color: '#ff9800' },
    { label: 'Q4', value: 95, color: '#9c27b0' }
  ];

  const documentData = [
    { label: 'Validés', value: stats?.documentsSoumis || 0, color: '#4caf50' },
    { label: 'En attente', value: (stats?.documentsRequis || 0) - (stats?.documentsSoumis || 0), color: '#ff9800' },
    { label: 'Rejetés', value: 2, color: '#f44336' }
  ];

  const performanceData = [
    {
      label: 'Documents',
      value: stats?.documentsSoumis || 0,
      max: stats?.documentsRequis || 1,
      unit: 'docs',
      color: 'primary' as const
    },
    {
      label: 'Visites',
      value: stats?.visitesTerminees || 0,
      max: stats?.visitesPlanifiees || 1,
      unit: 'visites',
      color: 'success' as const
    }
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Tableau de bord Entreprise
      </Typography>

      {/* Cartes de statut principal */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 3, 
        mb: 4 
      }}>
        <ArgonCard
          title="Statut de Conformité"
          value=""
          icon={<CheckCircle />}
          color="success"
          gradient={true}
        />
        <Box sx={{ mt: 2, p: 3 }}>
          <ComplianceTrafficLight 
            status={stats?.statutConformite || 'yellow'} 
            details={{
              requiredDocuments: stats?.documentsRequis || 0,
              submittedDocuments: stats?.documentsSoumis || 0,
              validDocuments: stats?.documentsSoumis || 0,
              lastUpdated: new Date().toISOString()
            }}
          />
        </Box>
        
        <ArgonCard
          title="Score Global"
          value={`${stats?.scoreGlobal || 0}/100`}
          icon={<TrendingUp />}
          color="primary"
          subtitle={`${stats?.kpiValides || 0}/${stats?.totalKpis || 0} KPI validés`}
        />
      </Box>

      {/* Métriques de performance */}
      <Box sx={{ mb: 4 }}>
        <ArgonPerformanceWidget
          title="Performance Générale"
          data={performanceData}
          type="linear"
        />
      </Box>

      {/* Graphiques et calendrier */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 3, 
        mb: 4 
      }}>
        <ArgonChartWidget
          title="Évolution des KPI"
          data={kpiData}
          type="bar"
          height={300}
        />
        
        <ArgonChartWidget
          title="Statut des Documents"
          data={documentData}
          type="pie"
          height={300}
        />
      </Box>

      {/* Calendrier et documents */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 3 
      }}>
        <ArgonChart
          title="Calendrier des Visites"
          icon={<CalendarToday />}
          height={400}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <VisitsCalendar />
          )}
        </ArgonChart>
        
        <ArgonChart
          title="Documents"
          icon={<Description />}
          height={400}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <DocumentsGallery />
          )}
        </ArgonChart>
      </Box>

      {/* Statistiques détaillées */}
      {stats && !loading && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Statistiques Détaillées
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
            gap: 3 
          }}>
            <ArgonCard
              title="Documents Soumis"
              value={`${stats.documentsSoumis}/${stats.documentsRequis}`}
              icon={<Description />}
              color="primary"
              subtitle={`${stats.documentsRequis > 0 ? Math.round((stats.documentsSoumis / stats.documentsRequis) * 100) : 0}% complété`}
            />
            <ArgonCard
              title="Visites Planifiées"
              value={stats.visitesPlanifiees}
              icon={<CalendarToday />}
              color="warning"
              subtitle="En attente"
            />
            <ArgonCard
              title="Visites Terminées"
              value={stats.visitesTerminees}
              icon={<CheckCircle />}
              color="success"
              subtitle="Complétées"
            />
            <ArgonCard
              title="Points de Données"
              value={stats.evolutionKpis?.length || 0}
              icon={<Assessment />}
              color="info"
              subtitle="KPI disponibles"
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default EnterpriseDashboard;
