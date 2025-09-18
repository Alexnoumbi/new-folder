import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container
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
import { getDashboardStats } from '../../services/dashboardService';
import { AdminStats } from '../../types/admin.types';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonChart from '../../components/Argon/ArgonChart';
import ArgonTimeline from '../../components/Argon/ArgonTimeline';
import { getEntreprisesEvolution, EntrepriseEvolutionPoint } from '../../services/dashboardService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [evolution, setEvolution] = useState<EntrepriseEvolutionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const now = new Date();
        const startParam = `${now.getFullYear()}-05`; // depuis mai de l'année courante
        const [statsData, evoData] = await Promise.all([
          getDashboardStats(),
          getEntreprisesEvolution(startParam)
        ]);
        if (mounted) {
          setStats(statsData);
          setEvolution(evoData);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="500px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Tableau de bord Administration
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const timelineData = stats?.dernieresActivites?.map(activity => ({
    id: activity._id,
    title: activity.action,
    description: activity.description,
    timestamp: activity.timestamp,
    type: getActivityType(activity.action),
    user: activity.user?.nom || 'Système'
  })) || [];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Tableau de bord Administration
      </Typography>
      
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolution} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#764ba2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#eee' }} cursor={{ stroke: '#aaa', strokeDasharray: '3 3' }} />
                <Legend />
                <Area type="monotone" dataKey="count" name="Nouvelles entreprises" stroke="#6a7fd2" strokeWidth={3} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ArgonChart>
        
        <ArgonChart
          title="Activité Récente"
          icon={<Timeline />}
          height={400}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <ArgonTimeline items={timelineData} />
          )}
        </ArgonChart>
      </Box>
    </Box>
  );
};

// Fonction utilitaire pour déterminer le type d'activité
const getActivityType = (action: string): 'success' | 'warning' | 'info' | 'error' => {
  const a = action.toLowerCase();
  if (a.includes('create') || a.includes('add') || a.includes('new') || a.includes('valid')) return 'success';
  if (a.includes('update') || a.includes('edit') || a.includes('modif') || a.includes('updat')) return 'info';
  if (a.includes('delete') || a.includes('remove') || a.includes('suppr') || a.includes('delet')) return 'error';
  if (a.includes('alert') || a.includes('error') || a.includes('warn')) return 'warning';
  return 'info';
};

export default AdminDashboard;
