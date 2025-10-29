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
  Select,
  FormControl,
  InputLabel,
  useTheme,
  alpha,
  Chip,
  Avatar,
  LinearProgress,
  Button,
  Paper,
  Tooltip,
  Divider,
  MenuItem
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  TrendingUp,
  TrendingDown,
  People,
  Business,
  Assessment,
  Warning,
  CheckCircle,
  Timeline,
  BarChart,
  MoreVert,
  FilterList,
  Download,
  Refresh,
  AttachMoney,
  CalendarToday,
  Insights,
  DynamicForm,
  FolderOpen,
  Forum,
  LibraryBooks,
  Map,
  AccountTree,
  Speed,
  CloudUpload,
  Security
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts';
import { getDashboardStats } from '../../services/dashboardService';
import { AdminStats } from '../../types/admin.types';
import { getEntreprisesEvolution, EntrepriseEvolutionPoint } from '../../services/dashboardService';
import AssistantFloatingButton from '../../components/Assistant/AssistantFloatingButton';
import AssistantWrapper from '../../components/Assistant/AssistantWrapper';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color = 'primary',
  subtitle 
}) => {
  const theme = useTheme();
  
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp fontSize="small" />;
    if (trend === 'down') return <TrendingDown fontSize="small" />;
    return null;
  };
  
  const getTrendColor = () => {
    if (trend === 'up') return theme.palette.success.main;
    if (trend === 'down') return theme.palette.error.main;
    return theme.palette.grey[500];
  };

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
        
        {change !== undefined && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box 
              sx={{ 
                color: getTrendColor(), 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: alpha(getTrendColor(), 0.1),
                borderRadius: 1,
                px: 1,
                py: 0.5
              }}
            >
              {getTrendIcon()}
              <Typography variant="body2" fontWeight={600} ml={0.5}>
                {change > 0 ? '+' : ''}{change}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              vs mois dernier
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [evolution, setEvolution] = useState<EntrepriseEvolutionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [showAssistant, setShowAssistant] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const now = new Date();
        const startParam = `${now.getFullYear()}-05`;
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

  const mainMetrics = [
    {
      title: 'Total Entreprises',
      value: stats?.totalEntreprises || 0,
      change: 12,
      trend: 'up' as const,
      icon: <Business sx={{ fontSize: 32 }} />,
      color: 'primary',
      subtitle: 'Partenaires enregistrés'
    },
    {
      title: 'Utilisateurs Actifs',
      value: stats?.utilisateursActifs || 0,
      change: 8,
      trend: 'up' as const,
      icon: <People sx={{ fontSize: 32 }} />,
      color: 'success',
      subtitle: 'Utilisateurs ce mois'
    },
    {
      title: 'KPI Validés',
      value: stats?.kpiValides || 0,
      change: 15,
      trend: 'up' as const,
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      color: 'info',
      subtitle: 'Indicateurs approuvés'
    },
    {
      title: 'Alertes',
      value: stats?.alertes || 0,
      change: -5,
      trend: 'down' as const,
      icon: <Warning sx={{ fontSize: 32 }} />,
      color: 'warning',
      subtitle: 'À traiter'
    }
  ];

  const getSecondaryColor = (colorName: string) => {
    switch (colorName) {
      case 'primary': return theme.palette.primary.main;
      case 'success': return theme.palette.success.main;
      case 'info': return theme.palette.info.main;
      case 'warning': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };

  const secondaryMetrics = [
    {
      title: 'Formulaires Actifs',
      value: 24,
      icon: <DynamicForm sx={{ fontSize: 28 }} />,
      color: 'primary',
      subtitle: '156 soumissions'
    },
    {
      title: 'Portfolios',
      value: 8,
      icon: <FolderOpen sx={{ fontSize: 28 }} />,
      color: 'success',
      subtitle: '42 projets'
    },
    {
      title: 'Cadres Logiques',
      value: 15,
      icon: <AccountTree sx={{ fontSize: 28 }} />,
      color: 'info',
      subtitle: 'Actifs'
    },
    {
      title: 'Discussions',
      value: 32,
      icon: <Forum sx={{ fontSize: 28 }} />,
      color: 'warning',
      subtitle: '12 ouvertes'
    },
    {
      title: 'Rapports Générés',
      value: 89,
      icon: <LibraryBooks sx={{ fontSize: 28 }} />,
      color: 'error',
      subtitle: 'Ce mois'
    },
    {
      title: 'Visites Terrain',
      value: 45,
      icon: <Map sx={{ fontSize: 28 }} />,
      color: 'primary',
      subtitle: '18 planifiées'
    }
  ];

  const impactData = [
    { category: 'Emplois Créés', value: 85 },
    { category: 'Formation', value: 92 },
    { category: 'Innovation', value: 78 },
    { category: 'Durabilité', value: 88 },
    { category: 'Inclusion', value: 75 }
  ];

  const budgetData = [
    { name: 'Allocué', value: 1000000 },
    { name: 'Dépensé', value: 840000 },
    { name: 'Engagé', value: 120000 },
    { name: 'Disponible', value: 40000 }
  ];

  const performanceData = [
    { month: 'Jan', portfolios: 4, projets: 12, formulaires: 8 },
    { month: 'Fév', portfolios: 6, projets: 15, formulaires: 12 },
    { month: 'Mar', portfolios: 5, projets: 18, formulaires: 15 },
    { month: 'Avr', portfolios: 7, projets: 20, formulaires: 18 },
    { month: 'Mai', portfolios: 8, projets: 25, formulaires: 22 },
    { month: 'Jun', portfolios: 9, projets: 28, formulaires: 24 }
  ];

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main
  ];

  const getActivityIcon = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('create') || a.includes('add') || a.includes('valid')) 
      return <CheckCircle sx={{ color: 'success.main' }} />;
    if (a.includes('update') || a.includes('edit')) 
      return <Assessment sx={{ color: 'info.main' }} />;
    if (a.includes('alert') || a.includes('warn')) 
      return <Warning sx={{ color: 'warning.main' }} />;
    return <Insights sx={{ color: 'primary.main' }} />;
  };

  const getQuickActionColor = (colorName: string) => {
    switch (colorName) {
      case 'primary': return theme.palette.primary.main;
      case 'success': return theme.palette.success.main;
      case 'info': return theme.palette.info.main;
      case 'warning': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };

  const quickActions = [
    { icon: <DynamicForm />, title: 'Créer un Formulaire', color: 'primary', path: '/admin/form-builder' },
    { icon: <FolderOpen />, title: 'Nouveau Portfolio', color: 'success', path: '/admin/portfolios/new' },
    { icon: <AccountTree />, title: 'Cadre Logique', color: 'info', path: '/admin/results-framework/new' },
    { icon: <LibraryBooks />, title: 'Générer Rapport', color: 'warning', path: '/admin/reports/generate' }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="500px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            border: 1,
            borderColor: 'error.main'
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>
    <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
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
                Tableau de Bord Administration
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Vue d'ensemble complète de votre plateforme TrackImpact
      </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Période</InputLabel>
                <Select
                  value={timeRange}
                  label="Période"
                  onChange={(e) => setTimeRange(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="7d">7 derniers jours</MenuItem>
                  <MenuItem value="30d">30 derniers jours</MenuItem>
                  <MenuItem value="90d">3 derniers mois</MenuItem>
                  <MenuItem value="1y">1 an</MenuItem>
                </Select>
              </FormControl>
              
              <Tooltip title="Actualiser">
                <IconButton
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                  }}
                >
                  <Refresh color="primary" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Télécharger">
                <IconButton
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                  }}
                >
                  <Download color="primary" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
      </Box>

        {/* Main Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {mainMetrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Actions Rapides
              </Typography>
              <Chip label="Nouveau" color="primary" size="small" />
            </Stack>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      border: 1,
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: `${action.color}.main`,
                        bgcolor: alpha(getQuickActionColor(action.color), 0.05),
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8]
                      }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: alpha(getQuickActionColor(action.color), 0.1),
                          color: `${action.color}.main`
                        }}
                      >
                        {action.icon}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {action.title}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Secondary Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {secondaryMetrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={2} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  border: 1,
                  borderColor: alpha(getSecondaryColor(metric.color), 0.2),
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(getSecondaryColor(metric.color), 0.1),
                      color: `${metric.color}.main`,
                      display: 'inline-flex',
                      mb: 1.5
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {metric.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {metric.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Performance Multi-Barres */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      }}
                    >
                      <BarChart sx={{ color: 'primary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Performance Globale
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Évolution des modules clés
                      </Typography>
            </Box>
                  </Stack>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Stack>
                
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsBarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RechartsTooltip />
                <Legend />
                    <Bar dataKey="portfolios" fill={theme.palette.primary.main} name="Portfolios" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="projets" fill={theme.palette.success.main} name="Projets" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="formulaires" fill={theme.palette.info.main} name="Formulaires" radius={[8, 8, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Budget Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.success.main, 0.1)
                    }}
                  >
                    <AttachMoney sx={{ color: 'success.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Répartition Budget
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Budget consolidé
                    </Typography>
                  </Box>
                </Stack>
                
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={budgetData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {budgetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
            </ResponsiveContainer>
                
                <Stack spacing={1.5} mt={2}>
                  {budgetData.map((item, index) => (
                    <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: COLORS[index % COLORS.length]
                          }}
                        />
                        <Typography variant="body2">{item.name}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight="bold">
                        {(item.value / 1000).toFixed(0)}K FCFA
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Bottom Section */}
        <Grid container spacing={3}>
          {/* Radar Impact */}
          <Grid item xs={12} md={6}>
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
                    <Insights sx={{ color: 'info.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Analyse d'Impact
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Performance multi-dimensionnelle
                    </Typography>
                  </Box>
                </Stack>
                
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={impactData}>
                    <PolarGrid stroke={theme.palette.divider} />
                    <PolarAngleAxis dataKey="category" stroke={theme.palette.text.secondary} />
                    <PolarRadiusAxis stroke={theme.palette.text.secondary} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke={theme.palette.primary.main}
                      fill={theme.palette.primary.main}
                      fillOpacity={0.6}
                    />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recent Activities */}
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
                    <Timeline sx={{ color: 'warning.main' }} />
            </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Activités Récentes
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dernières actions système
                    </Typography>
      </Box>
                </Stack>
                
                <Stack spacing={2}>
                  {stats?.dernieresActivites?.slice(0, 5).map((activity, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: alpha(theme.palette.grey[500], 0.02),
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderColor: alpha(theme.palette.primary.main, 0.3)
                        }
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="start">
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {getActivityIcon(activity.action)}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {activity.action}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {activity.description}
                          </Typography>
                          <Stack direction="row" spacing={2} mt={1}>
                            <Chip
                              label={activity.user?.nom || 'Système'}
                              size="small"
                              avatar={<Avatar sx={{ width: 24, height: 24 }}>
                                {activity.user?.nom?.charAt(0) || 'S'}
                              </Avatar>}
                            />
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              display="flex" 
                              alignItems="center"
                            >
                              <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </Typography>
                          </Stack>
    </Box>
                      </Stack>
                    </Paper>
                  )) || (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      Aucune activité récente
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Assistant Floating Button */}
      <AssistantFloatingButton
        type="admin"
        onClick={() => setShowAssistant(true)}
        hasUnreadMessages={false}
        badgeCount={0}
      />

      {/* Assistant Modal */}
      <AssistantWrapper
        open={showAssistant}
        onClose={() => setShowAssistant(false)}
        showAdvancedFeatures={false}
      />
    </>
  );
};

export default AdminDashboard;
