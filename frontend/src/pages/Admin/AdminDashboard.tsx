import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  People,
  Business,
  Assessment,
  Warning,
  CheckCircle,
  Timeline,
  BarChart
} from '@mui/icons-material';
import { getAdminStats, AdminStats } from '../../services/adminService';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonChart from '../../components/Argon/ArgonChart';
import ArgonTimeline from '../../components/Argon/ArgonTimeline';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getAdminStats();
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
          Tableau de bord Administration
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Données de démonstration pour la timeline
  const timelineData = [
    {
      id: '1',
      title: 'Nouvelle entreprise enregistrée',
      description: 'ABC Corporation a été ajoutée au système',
      timestamp: new Date().toISOString(),
      type: 'success' as const,
      user: 'Admin'
    },
    {
      id: '2',
      title: 'KPI validé',
      description: 'Les indicateurs de performance ont été approuvés',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'info' as const,
      user: 'Superviseur'
    },
    {
      id: '3',
      title: 'Alerte système',
      description: 'Problème de connexion détecté',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      type: 'warning' as const,
      user: 'Système'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Tableau de bord Administration
      </Typography>
      
      {/* Cartes de statistiques avec style Argon */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        <ArgonCard
          title="Total Entreprises"
          value={stats?.totalEntreprises || 0}
          icon={<Business />}
          color="primary"
          change="+12%"
          loading={loading}
          gradient={true}
        />
        <ArgonCard
          title="Utilisateurs Actifs"
          value={stats?.utilisateursActifs || 0}
          icon={<People />}
          color="success"
          change="+8%"
          loading={loading}
        />
        <ArgonCard
          title="KPI Validés"
          value={stats?.kpiValides || 0}
          icon={<CheckCircle />}
          color="success"
          change="+15%"
          loading={loading}
        />
        <ArgonCard
          title="Alertes"
          value={stats?.alertes || 0}
          icon={<Warning />}
          color="warning"
          change="-5%"
          loading={loading}
        />
      </Box>

      {/* Graphiques et timeline */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, 
        gap: 3 
      }}>
        <ArgonChart
          title="Évolution des Entreprises"
          icon={<BarChart />}
          height={400}
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
                Graphique des tendances
              </Typography>
              <Typography color="textSecondary" variant="body2" sx={{ ml: 1 }}>
                ({stats?.evolutionEntreprises?.length || 0} points de données)
              </Typography>
            </Box>
          )}
        </ArgonChart>
        
        <ArgonChart
          title="Activité Récente"
          icon={<Timeline />}
          height={400}
        >
          <ArgonTimeline 
            items={timelineData}
          />
        </ArgonChart>
      </Box>
    </Box>
  );
};

export default AdminDashboard;

