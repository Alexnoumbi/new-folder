import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Chip,
  LinearProgress,
  Paper,
  Tooltip,
  Divider
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Memory,
  Storage,
  Speed,
  Computer,
  CloudQueue,
  Refresh,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Timeline,
  BarChart,
  NetworkCheck,
  Security
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getSystemStats, SystemStats } from '../../services/monitoringService';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  progress?: number;
  subtitle?: string;
  status?: 'success' | 'warning' | 'error';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'primary',
  progress,
  subtitle,
  status = 'success'
}) => {
  const theme = useTheme();
  
  const getColorMain = () => {
    switch (color) {
      case 'primary': return theme.palette.primary.main;
      case 'success': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'info': return theme.palette.info.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.success.main;
    }
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(getColorMain(), 0.1)} 0%, ${alpha(getColorMain(), 0.05)} 100%)`,
        border: 1,
        borderColor: alpha(getColorMain(), 0.2),
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(getColorMain(), 0.2)}`
        }
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" color={getColorMain()}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(getColorMain(), 0.15),
              color: getColorMain()
            }}
          >
            {icon}
          </Box>
        </Stack>
        
        {progress !== undefined && (
          <Box>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                Utilisation
              </Typography>
              <Typography variant="caption" fontWeight={600} color={getStatusColor()}>
                {progress}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${getStatusColor()} 0%, ${alpha(getStatusColor(), 0.7)} 100%)`
                }
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const AdminMonitoring: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cpuHistory, setCpuHistory] = useState<Array<{ time: string; value: number }>>([]);
  const [memoryHistory, setMemoryHistory] = useState<Array<{ time: string; value: number }>>([]);

    const fetchStats = async () => {
      try {
        setLoading(true);
      setError(null);
        const data = await getSystemStats();
        setStats(data);
      
      // Ajouter aux historiques
      const now = new Date().toLocaleTimeString();
      setCpuHistory(prev => [...prev.slice(-19), { time: now, value: data.system.cpu }]);
      setMemoryHistory(prev => [...prev.slice(-19), { time: now, value: data.system.memory.percentage }]);
      
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques système');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Actualisation toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const getMemoryStatus = () => {
    const pct = stats?.system.memory.percentage || 0;
    if (pct >= 90) return 'error';
    if (pct >= 75) return 'warning';
    return 'success';
  };

  const getCPUStatus = () => {
    const cpu = stats?.system.cpu || 0;
    if (cpu >= 80) return 'error';
    if (cpu >= 60) return 'warning';
    return 'success';
  };

  const getDiskStatus = () => {
    const pct = stats?.system.disk.percentage || 0;
    if (pct >= 90) return 'error';
    if (pct >= 75) return 'warning';
    return 'success';
  };

  const diskData = [
    { name: 'Utilisé', value: stats?.system.disk.used || 0, color: theme.palette.primary.main },
    { name: 'Libre', value: stats?.system.disk.free || 0, color: theme.palette.success.main }
  ];

  const memoryData = [
    { name: 'Utilisée', value: stats?.system.memory.used || 0, color: theme.palette.warning.main },
    { name: 'Libre', value: stats?.system.memory.free || 0, color: theme.palette.success.main }
  ];

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}j ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={3}>
    <Box>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              gutterBottom
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
        Monitoring Système
      </Typography>
            <Typography variant="body1" color="text.secondary">
              Surveillance en temps réel des performances et de la santé du système
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip 
              label="Mise à jour auto - 5s" 
              color="primary" 
              size="small"
              icon={<Timeline />}
            />
            <Tooltip title="Actualiser">
              <IconButton
                onClick={fetchStats}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Refresh color="primary" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Main Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="CPU"
            value={`${stats?.system.cpu || 0}%`}
            icon={<Speed sx={{ fontSize: 32 }} />}
            color={getCPUStatus() === 'error' ? 'error' : getCPUStatus() === 'warning' ? 'warning' : 'success'}
            progress={stats?.system.cpu || 0}
            subtitle="Utilisation processeur"
            status={getCPUStatus()}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Mémoire RAM"
            value={`${stats?.system.memory.percentage || 0}%`}
            icon={<Memory sx={{ fontSize: 32 }} />}
            color={getMemoryStatus() === 'error' ? 'error' : getMemoryStatus() === 'warning' ? 'warning' : 'info'}
            progress={stats?.system.memory.percentage || 0}
            subtitle={`${stats?.system.memory.used || 0} MB / ${stats?.system.memory.total || 0} MB`}
            status={getMemoryStatus()}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Stockage"
            value={`${stats?.system.disk.percentage || 0}%`}
            icon={<Storage sx={{ fontSize: 32 }} />}
            color={getDiskStatus() === 'error' ? 'error' : getDiskStatus() === 'warning' ? 'warning' : 'primary'}
            progress={stats?.system.disk.percentage || 0}
            subtitle={`${Math.round((stats?.system.disk.used || 0) / 1000)} GB / ${Math.round((stats?.system.disk.total || 0) / 1000)} GB`}
            status={getDiskStatus()}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Base de Données"
            value={stats?.database.status === 'connected' ? 'Connecté' : 'Déconnecté'}
            icon={<CloudQueue sx={{ fontSize: 32 }} />}
            color={stats?.database.status === 'connected' ? 'success' : 'error'}
            subtitle={`${stats?.database.connections || 0} connexions actives`}
            status={stats?.database.status === 'connected' ? 'success' : 'error'}
          />
        </Grid>
      </Grid>

      {/* Secondary Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1)
                }}
              >
                <Computer sx={{ color: 'info.main' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Uptime Serveur
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {formatUptime(stats?.process.uptime || 0)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.1)
                }}
              >
                <NetworkCheck sx={{ color: 'success.main' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Requêtes/min
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {stats?.requests.perMinute || 0}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.1)
                }}
              >
                <ErrorIcon sx={{ color: 'warning.main' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Erreurs
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {stats?.requests.errors || 0}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.1)
                }}
              >
                <CheckCircle sx={{ color: 'success.main' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Taux de Succès
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {stats?.requests.successRate || 0}%
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* CPU Chart */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }}
                >
                  <Speed sx={{ color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Utilisation CPU en Temps Réel
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Dernières 20 mesures (5s)
                  </Typography>
                </Box>
              </Stack>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cpuHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="time" stroke={theme.palette.text.secondary} fontSize={12} />
                  <YAxis stroke={theme.palette.text.secondary} fontSize={12} domain={[0, 100]} />
                  <RechartsTooltip />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={theme.palette.primary.main} 
                    fill={alpha(theme.palette.primary.main, 0.3)} 
                    name="CPU %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Memory Chart */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.main, 0.1)
                  }}
                >
                  <Memory sx={{ color: 'info.main' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Utilisation Mémoire en Temps Réel
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Dernières 20 mesures (5s)
                  </Typography>
                </Box>
              </Stack>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={memoryHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="time" stroke={theme.palette.text.secondary} fontSize={12} />
                  <YAxis stroke={theme.palette.text.secondary} fontSize={12} domain={[0, 100]} />
                  <RechartsTooltip />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={theme.palette.info.main} 
                    fill={alpha(theme.palette.info.main, 0.3)} 
                    name="Mémoire %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pie Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Disk Usage */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }}
                >
                  <Storage sx={{ color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Répartition Disque
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Espace utilisé vs libre
                  </Typography>
                </Box>
              </Stack>
              
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={diskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {diskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>

              <Stack spacing={1} mt={2}>
                {diskData.map((item, index) => (
                  <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: item.color
                        }}
                      />
                      <Typography variant="body2">{item.name}</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight="bold">
                      {Math.round(item.value / 1000)} GB
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Memory Usage */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.1)
                  }}
                >
                  <Memory sx={{ color: 'warning.main' }} />
      </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Répartition Mémoire RAM
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Mémoire utilisée vs libre
                  </Typography>
    </Box>
              </Stack>
              
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={memoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {memoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>

              <Stack spacing={1} mt={2}>
                {memoryData.map((item, index) => (
                  <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: item.color
                        }}
                      />
                      <Typography variant="body2">{item.name}</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight="bold">
                      {item.value} MB
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Info */}
      <Grid container spacing={3}>
        {/* OS Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Informations Système
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Plateforme</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats?.system.osInfo.platform}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Type OS</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats?.system.osInfo.type}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Release</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats?.system.osInfo.release}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Architecture</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats?.system.osInfo.architecture}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Hostname</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats?.system.osInfo.hostname}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Process Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Informations Processus Node.js
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Version Node</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats?.process.nodeVersion}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">PID</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats?.process.pid}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Uptime</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatUptime(stats?.process.uptime || 0)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Heap Utilisé</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatBytes(stats?.process.memory.heapUsed || 0)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Heap Total</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatBytes(stats?.process.memory.heapTotal || 0)}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Database Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Base de Données
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Statut</Typography>
                  <Chip 
                    label={stats?.database.status || 'unknown'} 
                    color={stats?.database.status === 'connected' ? 'success' : 'error'}
                    size="small"
                  />
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Connexions Actives</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats?.database.connections || 0}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Temps de Réponse</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats?.database.responseTime || 0} ms</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Requests Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Statistiques Requêtes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Total Requêtes</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {(stats?.requests.total || 0).toLocaleString()}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Requêtes/minute</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats?.requests.perMinute || 0}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Erreurs</Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">
                    {stats?.requests.errors || 0}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Taux de Succès</Typography>
                  <Chip 
                    label={`${stats?.requests.successRate || 0}%`}
                    color={
                      (stats?.requests.successRate || 0) >= 99 ? 'success' : 
                      (stats?.requests.successRate || 0) >= 95 ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminMonitoring;
