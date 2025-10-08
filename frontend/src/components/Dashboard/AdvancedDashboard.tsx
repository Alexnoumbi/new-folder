import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
  alpha,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Tooltip
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  TrendingUp,
  TrendingDown,
  MoreVert,
  FilterList,
  Download,
  Refresh,
  Business,
  People,
  AttachMoney,
  Assessment,
  CheckCircle,
  Warning,
  Error,
  CalendarToday
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
  Radar
} from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon, color = 'primary' }) => {
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
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(getColorMain(), 0.1)
            }}
          >
            {icon}
          </Box>
        </Stack>
        
        {change !== undefined && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ color: getTrendColor(), display: 'flex', alignItems: 'center' }}>
              {getTrendIcon()}
            </Box>
            <Typography variant="body2" sx={{ color: getTrendColor() }}>
              {change > 0 ? '+' : ''}{change}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              vs mois dernier
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

const AdvancedDashboard: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('30d');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Données mockées pour la démonstration
  const metrics = [
    {
      title: 'Projets Actifs',
      value: 24,
      change: 12,
      trend: 'up' as const,
      icon: <Business sx={{ color: 'primary.main' }} />,
      color: 'primary'
    },
    {
      title: 'Bénéficiaires Atteints',
      value: '12.5K',
      change: 8,
      trend: 'up' as const,
      icon: <People sx={{ color: 'success.main' }} />,
      color: 'success'
    },
    {
      title: 'Budget Exécuté',
      value: '84%',
      change: -3,
      trend: 'down' as const,
      icon: <AttachMoney sx={{ color: 'warning.main' }} />,
      color: 'warning'
    },
    {
      title: 'Indicateurs Suivis',
      value: 156,
      change: 15,
      trend: 'up' as const,
      icon: <Assessment sx={{ color: 'info.main' }} />,
      color: 'info'
    }
  ];
  
  const projectPerformanceData = [
    { month: 'Jan', completed: 4, inProgress: 8, delayed: 2 },
    { month: 'Fév', completed: 6, inProgress: 10, delayed: 1 },
    { month: 'Mar', completed: 8, inProgress: 12, delayed: 3 },
    { month: 'Avr', completed: 10, inProgress: 9, delayed: 2 },
    { month: 'Mai', completed: 12, inProgress: 11, delayed: 1 },
    { month: 'Jun', completed: 14, inProgress: 8, delayed: 2 }
  ];
  
  const budgetData = [
    { name: 'Allocué', value: 1000000 },
    { name: 'Dépensé', value: 840000 },
    { name: 'Engagé', value: 120000 },
    { name: 'Disponible', value: 40000 }
  ];
  
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main
  ];
  
  const impactData = [
    { category: 'Emplois Créés', value: 85 },
    { category: 'Formation', value: 92 },
    { category: 'Innovation', value: 78 },
    { category: 'Durabilité', value: 88 },
    { category: 'Inclusion', value: 75 }
  ];
  
  const recentActivities = [
    {
      type: 'submission',
      title: 'Nouveau rapport soumis',
      project: 'Projet Agricole Nord',
      time: 'Il y a 2h',
      user: 'Jean Kamga'
    },
    {
      type: 'approval',
      title: 'Indicateur validé',
      project: 'Programme Jeunesse',
      time: 'Il y a 5h',
      user: 'Marie Dubois'
    },
    {
      type: 'alert',
      title: 'Budget dépassé',
      project: 'Infrastructure Sud',
      time: 'Il y a 1j',
      user: 'System'
    }
  ];
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'approval':
        return <CheckCircle sx={{ color: 'primary.main' }} />;
      case 'alert':
        return <Warning sx={{ color: 'warning.main' }} />;
      default:
        return <Assessment />;
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header avec filtres */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Tableau de Bord Avancé
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vue d'ensemble de vos projets et indicateurs
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Période</InputLabel>
            <Select
              value={timeRange}
              label="Période"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7d">7 derniers jours</MenuItem>
              <MenuItem value="30d">30 derniers jours</MenuItem>
              <MenuItem value="90d">3 derniers mois</MenuItem>
              <MenuItem value="1y">1 an</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton>
            <FilterList />
          </IconButton>
          <IconButton>
            <Refresh />
          </IconButton>
          <IconButton>
            <Download />
          </IconButton>
        </Stack>
      </Box>
      
      {/* Métriques principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>
      
      {/* Graphiques principaux */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Performance des projets */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  Performance des Projets
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Stack>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={projectPerformanceData}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDelayed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke={theme.palette.success.main}
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                    name="Terminés"
                  />
                  <Area
                    type="monotone"
                    dataKey="inProgress"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorInProgress)"
                    name="En cours"
                  />
                  <Area
                    type="monotone"
                    dataKey="delayed"
                    stroke={theme.palette.error.main}
                    fillOpacity={1}
                    fill="url(#colorDelayed)"
                    name="En retard"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Répartition du budget */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Répartition du Budget
              </Typography>
              
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
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
              
              <Stack spacing={1} mt={2}>
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
      
      {/* Section Impact et Activités */}
      <Grid container spacing={3}>
        {/* Radar Chart - Impact */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Analyse d'Impact
              </Typography>
              
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
        
        {/* Activités récentes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Activités Récentes
              </Typography>
              
              <Stack spacing={2} mt={2}>
                {recentActivities.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.grey[500], 0.05),
                      border: 1,
                      borderColor: 'divider'
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="start">
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {activity.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.project}
                        </Typography>
                        <Stack direction="row" spacing={2} mt={1}>
                          <Chip
                            label={activity.user}
                            size="small"
                            avatar={<Avatar>{activity.user.charAt(0)}</Avatar>}
                          />
                          <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                            <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                            {activity.time}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdvancedDashboard;

