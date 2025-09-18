import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
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
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import { loadEnterpriseDashboard } from '../../services/authService';

const EnterpriseDashboard: React.FC = () => {
  const [stats, setStats] = useState<EntrepriseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const storedDashboard = localStorage.getItem('enterpriseDashboard');
        if (storedDashboard) {
          setStats(JSON.parse(storedDashboard));
          setLoading(false);
          return;
        }
        if (user && user.typeCompte === 'entreprise') {
          const data = await loadEnterpriseDashboard(user);
          if (data?.dashboard) {
            setStats(data.dashboard);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [user]);

  if (!user || user.typeCompte !== 'entreprise') {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={() => window.location.reload()}>
          RÉESSAYER
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert severity="warning">
        Aucune donnée disponible. Veuillez contacter l'administrateur.
      </Alert>
    );
  }

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Tableau de bord Entreprise
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vue d'ensemble de vos indicateurs, documents et visites
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
      </Box>

      {/* Cartes de statut principal */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
        gap: 2, 
        mb: 3 
      }}>
        <ArgonCard
          title="Statut de Conformité"
          value=""
          icon={<CheckCircle />}
          color="success"
        />
        <ArgonCard
          title="Score Global"
          value={`${stats?.scoreGlobal || 0}/100`}
          icon={<TrendingUp />}
          color="primary"
          subtitle={`${stats?.kpiValides || 0}/${stats?.totalKpis || 0} KPI validés`}
        />
        <ArgonCard
          title="Documents Requis"
          value={`${stats?.documentsSoumis || 0}/${stats?.documentsRequis || 0}`}
          icon={<Description />}
          color="info"
        />
      </Box>

      {/* Métriques de performance */}
      <Box sx={{ mb: 3 }}>
        <ArgonPerformanceWidget
          title="Performance Générale"
          data={performanceData}
          type="linear"
        />
      </Box>

      {/* Calendrier */}
      <Box sx={{ mb: 3 }}>
        <ArgonChart title="Calendrier des Visites" icon={<CalendarToday />} height={720}>
          <VisitsCalendar />
        </ArgonChart>
      </Box>

      {/* Documents - retiré */}
    </Box>
  );
};

export default EnterpriseDashboard;
